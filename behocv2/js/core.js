// ================================
// BÉ VUI HỌC - CORE MENU
// ================================

function unlockAudio() {

    document
        .getElementById("start-overlay")
        .style.display = "none";

    document
        .getElementById("menu-screen")
        .style.display = "flex";
}



// ================================
// PWA
// ================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("/sw.js")
            .then(reg => {
                console.log("SW Registered!", reg);
            })
            .catch(err => {
                console.log("SW Failed", err);
            });

    });

}



// ================================
// NÚT CÀI APP
// ================================

let deferredPrompt;

const installBtn =
    document.getElementById("pwa-install-btn");

const iosGuide =
    document.getElementById("ios-guide");



const isStandalone =

    window.matchMedia("(display-mode: standalone)").matches

    ||

    window.navigator.standalone === true;



if (isStandalone) {

    if (installBtn)
        installBtn.style.display = "none";

    if (iosGuide)
        iosGuide.style.display = "none";

}
else {

    window.addEventListener(
        "beforeinstallprompt",
        (e) => {

            e.preventDefault();

            deferredPrompt = e;

            if (installBtn)
                installBtn.style.display = "block";
        }
    );



    if (installBtn) {

        installBtn.addEventListener(
            "click",
            async () => {

                if (!deferredPrompt)
                    return;

                deferredPrompt.prompt();

                await deferredPrompt.userChoice;

                deferredPrompt = null;

                installBtn.style.display = "none";
            }
        );
    }



    const isIOS =

        /iPad|iPhone|iPod/.test(
            navigator.userAgent
        )

        &&

        !window.MSStream;



    if (isIOS && iosGuide) {

        iosGuide.style.display = "block";
    }
}