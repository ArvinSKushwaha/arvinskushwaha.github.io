use std::fmt::Debug;
use std::fs;
use std::path::{Path, PathBuf};
use std::str::FromStr;
use syntect::highlighting::ThemeSet;
use thiserror::Error;

const TEMPLATE_PATH: &str = "./template.html";
const CODE_THEME_FOLDER: &str = ".";
const PAGE_PATH: &str = "./pages";
const BUILD_PATH: &str = "./build";

enum VEntry {
    VDir {
        name: String,
        path: PathBuf,
        children: Vec<VEntry>,
    },
    VFile {
        name: String,
        path: PathBuf,
    },
}

#[derive(Error, Debug)]
enum VEntryError {
    #[error("Path is either invalid or unreadable as `String`")]
    InvalidPath,
    #[error("IOError encountered")]
    PathNotFound(#[from] std::io::Error),
    #[error("A symlink was enountered. This is not currently supported")]
    SymlinkEncountered,
    #[error("Not a directory")]
    NotADirectory,
}

impl VEntry {
    pub fn mimic_path(path: &Path) -> Result<Self, VEntryError> {
        let path = path.canonicalize()?;
        let metadata = fs::metadata(&path)?;
        if metadata.is_symlink() {
            return Err(VEntryError::SymlinkEncountered);
        }
        let name = path
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or(VEntryError::InvalidPath)?
            .to_string();

        Ok(if metadata.is_file() {
            VEntry::VFile { name, path }
        } else {
            VEntry::VDir {
                name,
                children: path
                    .read_dir()?
                    .flat_map(|entry| -> Result<_, VEntryError> {
                        Ok(VEntry::mimic_path(&entry?.path()))
                    })
                    .collect::<Result<Vec<_>, VEntryError>>()?,
                path,
            }
        })
    }

    fn fmt_with_indent(&self, f: &mut std::fmt::Formatter<'_>, indent: usize) -> std::fmt::Result {
        for _ in 0..indent {
            write!(f, "    ")?;
        }
        match self {
            VEntry::VDir { name, .. } => writeln!(f, "{name}")?,
            VEntry::VFile { name, .. } => writeln!(f, "{name}")?,
        }

        if let VEntry::VDir { children, .. } = self {
            for child in children {
                child.fmt_with_indent(f, indent + 1)?;
            }
        }
        Ok(())
    }

    fn apply_to_files(
        &self,
        new_path: &Path,
        name_transformation: &dyn Fn(&str) -> Option<Result<String, String>>,
        content_transformation: &dyn Fn(Vec<u8>) -> Vec<u8>,
    ) -> Result<(), VEntryError> {
        match self {
            VEntry::VDir { children, .. } => {
                // Attempt to instantiate the new_path
                fs::create_dir_all(new_path)?;

                // Now, walk through path and apply transformation
                for child in children {
                    if let VEntry::VFile { path, name, .. } = child {
                        if let Some(name) = name_transformation(name) {
                            let content = if name.is_ok() {
                                content_transformation(fs::read(path)?)
                            } else {
                                fs::read(path)?
                            };
                            fs::write(
                                new_path.join(match name {
                                    Ok(name) => name,
                                    Err(name) => name,
                                }),
                                content,
                            )?;
                        }
                    } else if let VEntry::VDir { name, .. } = child {
                        child.apply_to_files(
                            &new_path.join(name),
                            name_transformation,
                            content_transformation,
                        )?;
                    }
                }
            }
            VEntry::VFile { .. } => {
                return Err(VEntryError::NotADirectory);
            }
        }

        Ok(())
    }
}

impl Debug for VEntry {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        self.fmt_with_indent(f, 0)
    }
}

fn main() -> anyhow::Result<()> {
    let template = String::from_utf8(fs::read(TEMPLATE_PATH)?)?;
    let (left, right) = template
        .split_once("<!-- % INSERT_HERE % -->")
        .ok_or_else(|| anyhow::anyhow!("No `<!-- % INSERT_HERE % -->` found in template file"))?;
    let page_dir = PathBuf::from_str(PAGE_PATH)?;
    let build_dir = PathBuf::from_str(BUILD_PATH)?;
    let vdir = VEntry::mimic_path(&page_dir)?;

    let syntect = comrak::plugins::syntect::SyntectAdapterBuilder::new()
        .theme("BlackboardBlack")
        .theme_set(ThemeSet::load_from_folder(CODE_THEME_FOLDER)?)
        .build();
    let plugins = comrak::ComrakPlugins {
        render: comrak::ComrakRenderPlugins {
            codefence_syntax_highlighter: Some(&syntect),
        },
    };

    let parsing = comrak::ComrakOptions {
        extension: comrak::ComrakExtensionOptions {
            strikethrough: true,
            tagfilter: true,
            table: true,
            autolink: true,
            tasklist: true,
            superscript: true,
            footnotes: true,
            description_lists: true,
            ..Default::default()
        },
        render: comrak::ComrakRenderOptions {
            unsafe_: true,
            ..Default::default()
        },
        ..Default::default()
    };

    println!("{:?}", vdir);

    vdir.apply_to_files(
        &build_dir,
        // Copy all files, but make .md files html files
        &|name: &str| {
            Some({
                if name.contains(".md") {
                    Ok(name.replace(".md", ".html"))
                } else {
                    Err(name.to_string())
                }
            })
        },
        &|data: Vec<u8>| {
            let pre_iter = left.as_bytes().iter();
            let data_str = comrak::markdown_to_html_with_plugins(
                &String::from_utf8_lossy(&data),
                &parsing,
                &plugins,
            );
            let data_iter = data_str.as_bytes().iter();
            let post_iter = right.as_bytes().iter();

            pre_iter
                .chain(data_iter)
                .chain(post_iter)
                .copied()
                .collect::<Vec<_>>()
        },
    )?;

    Ok(())
}
