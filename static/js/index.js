let quoteLines = [
    'a Student',
    'a Developer',
    'a Leader',
    'an Innovator',
];

let addBit = true;
let currIndex = 0
let currWord = quoteLines[currIndex];
let index = 0;
let pausePlay = false;
let wait = 30;
let currWait = 0;
let currRepr = "";

let getScrollHeight = () => { return window.scrollY };

let show_panel = (panel_num) => {
    let panels = document.getElementsByClassName("panel");
    let panel_links = document.getElementsByClassName("span_wrap");
    for (let index = 0; index < document.getElementsByClassName("panel").length; index++) {
        if (index < Math.floor(panel_num)) {
            $(panels[index]).removeClass('show');
            $(panels[index]).addClass('exit');
        }
        else if (Math.floor(panel_num) == index) {
            $(panels[index]).removeClass('exit');
            $(panels[index]).addClass('show');
        }
        else {
            $(panels[index]).removeClass('show exit');
        }
        if (Math.floor(panel_num) == index) {
            $(panel_links[index]).addClass('active');
        }
        else {
            $(panel_links[index]).removeClass('active');
        }
    }
    if (panel_num > 0) {
        $("#title, #menu_nav").addClass("collapsed");
        $(".span_wrap").addClass("hide_border");
    }
    else {
        $("#title, #menu_nav").removeClass("collapsed");
        $(".span_wrap").removeClass("hide_border");
    }
}

$(
    () => {
        let resizeTimer;
        window.addEventListener("resize", () => {
            document.body.classList.add("resize-animation-stopper");
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                document.body.classList.remove("resize-animation-stopper");
            }, 400);
        });

        let curr_panel = 0;

        let hammertime = new Hammer(document.querySelector('#panel1'));
        hammertime.on('swipe', (ev) => {
            console.log(ev);
        });
        let panels = document.getElementsByClassName("panel");
        $('div#tall.tall').height(window.innerHeight * panels.length);
        for (let index = 0; index < document.getElementsByClassName("panel").length; index++) {
            $(panels[index]).addClass(['up_left_start', 'left_up_start'][index % 2]);
        }

        setTimeout(() => { $("#title, #menu_nav, #mob-menu").addClass("show"); });

        $(document).bind('scroll', () => {
            let h = getScrollHeight();
            let panel_num = h / window.innerHeight;
            curr_panel = panel_num;
            show_panel(panel_num);
        });

        setInterval(() => {
            if (pausePlay) {
                currWait++;
                $("#iAm").addClass("blinking");
            }
            if (addBit && !pausePlay) {
                currRepr += currWord[index];
                index++;
            }

            if (!addBit && !pausePlay) {
                currRepr = currRepr.slice(0, -1);
                index--;
            }

            document.getElementById("quoteLine").innerHTML = currRepr;
            if (index == 0 || index == currWord.length && !pausePlay) {
                addBit = !addBit
                pausePlay = true;
            }

            if (currWait == wait) {
                currWait = 0;
                pausePlay = false;
                if (index == 0) {
                    currIndex = (currIndex + 1) % quoteLines.length;
                    currWord = quoteLines[currIndex];
                    addBit = true;
                }
            }
        }, 40);
        $("#lefty-button").bind('click', () => {
            $(document).scrollTop(window.innerHeight);
        });

        $(".span_wrap").bind('click', (e) => {
            let num = (parseInt($(e.target).attr('name').slice(5)) - 1)
            $(document).scrollTop(num * window.innerHeight + (num ? window.innerHeight / 2.0 : 0));
        });

        $("#mob-menu-panel > span").bind('click', (e) => {
            console.log("Oui");
            let num = (parseInt($(e.target).attr('name').slice(5)) - 1)
            $(document).scrollTop(num * window.innerHeight + (num ? window.innerHeight / 2.0 : 0));
        });

        $("i[name]").bind('click', (e) => {
            let num = (parseInt($(e.target).attr('name').slice(5)) - 1)
            $(document).scrollTop(num * window.innerHeight + (num ? window.innerHeight / 2.0 : 0));
        });

        $("body").removeClass("hidden");

        $("#mob-menu").bind('click', (e) => {
            $("#mob-menu-panel").toggleClass("show");
        });

        $("#mob-menu-panel > span").bind('click', (e) => {
            $("#mob-menu-panel").removeClass("show");
        });
    }
);