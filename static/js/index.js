let quoteLines = [
    'a Student',
    'a Developer',
    'a Leader',
    'an Educator',
    'a Scientist',
    'a Learner'
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

$(
    () => {
        let panels = document.getElementsByClassName("panel");
        $('div#tall.tall').height(window.innerHeight * panels.length);
        for (let index = 0; index < document.getElementsByClassName("panel").length; index++) {
            $(panels[index]).addClass(['up_left_start', 'left_up_start'][index % 2]);
        }

        setTimeout(() => { $("#title, #menu_nav").addClass("show"); });

        $(document).bind('scroll', () => {
            let h = getScrollHeight();
            let panel_num = h / window.innerHeight;
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
                if (Math.floor(panel_num) == index)
                {
                    $(panel_links[index]).addClass('active');
                }
                else {
                    $(panel_links[index]).removeClass('active');
                }
            }
            if (h > 0) {
                $("#title, #menu_nav").addClass("collapsed");
                $(".span_wrap").addClass("hide_border");
            }
            else {
                $("#title, #menu_nav").removeClass("collapsed");
                $(".span_wrap").removeClass("hide_border");
            }
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
            $(document).scrollTop((parseInt($(e.target).attr('name').slice(5)) - 1) * window.innerHeight);
        });

        $("i[name]").bind('click', (e) => {
            $(document).scrollTop((parseInt($(e.target).attr('name').slice(5)) - 1) * window.innerHeight);
        });

        $("body").removeClass("hidden");
    }
);