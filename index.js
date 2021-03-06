const $ = (id) => document.getElementById(id)
const numbers = [
    ["十進位 (Dec)", "dec", 10],
    ["十六進位 (Hex)", "hex", 16, "0x"],
    ["二進位 (Bin)", "bin", 2, "0b"],
    ["八進位 (Oct)", "oct", 8]
]

const url = "https://calc.iskane.me"

for(let num of numbers) {
    const prefix = num[3] ?? ''
    const selector = $(num[1])

    selector.addEventListener('input', (e) => {
        if(selector.value.length === 0 || /^0+$/.test(selector.value.slice(prefix.length)) || (num[3] && selector.value.slice(prefix.length).length <= 0)) {
            e.preventDefault()
            selector.value = `${prefix}0`
        }
        if(/^0+/.test(selector.value.slice(prefix.length)) && !selector.value.endsWith('0'))
            selector.value = `${prefix}${selector.value.slice(prefix.length).replace(/^0+/, '')}`

        for(let to_change of numbers) {
            if(num === to_change)
                continue

            let value = selector.value
            if(num[3])
                 value = value.slice(num[3].length)
            let target = parseFloat(value, num[2])

            if((isNaN(target) || !isFinite(target)) && value.length !== 0) {
                $(to_change[1]).value = '錯誤'
                continue
            }

            $(to_change[1]).value = (to_change[3] ?? '') +
                (value.length === 0 ? '0' : target.toString(to_change[2])).toUpperCase()
        }
    })

    if(!num[3])
        continue

    selector.addEventListener('select', () => {
        if(selector.selectionStart < num[3].length && selector.value.startsWith(num[3]))
            selector.setSelectionRange(num[3].length, selector.selectionEnd)
    })
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
for(let soc of socials) {
    let {button, image} = buildShareButton(soc[0], soc[1])

    button.addEventListener('click', () => {
        window.open(
            soc[2],
            image.alt,
            'width=800,height=600'
        )
    })

    $('social').appendChild(button)
}

if(!!navigator.share) {
    let {button, image} = buildShareButton('share', '#474fff')

    button.addEventListener('click', () => {
        navigator.share({
            title: '進位計算機', url
        }).catch(() => {})
    })

    $('social').appendChild(button)
}

function buildShareButton(name, color) {
    let div = document.createElement('div'),
        img = document.createElement('img')

    div.classList.add('social')
    div.classList.add(name)
    img.classList.add('icon')
    div.style.backgroundColor = color
    img.src = `/img/social/${name}.svg`
    img.alt = `透過 ${capitalize(name)} 分享`
    img.title = img.alt

    div.appendChild(img)

    return {button: div, image: img}
}

// https://stackoverflow.com/questions/5055723/converting-hexadecimal-to-float-in-javascript
function parseFloat(str, radix)
{
    if(!str)
        return 0
    const parts = str.split(".")
    if (parts.length > 1)
        return parseInt(parts[0], radix) + parseInt(parts[1], radix) / Math.pow(radix, parts[1].length)
    return parseInt(parts[0], radix)
}


// install check
if(!!navigator?.serviceWorker) {
    const channel4Broadcast = new BroadcastChannel('channel4')

    channel4Broadcast.onmessage = (e) => {
        switch (e.data.type) {
            case "install":
                Swal.fire({
                    toast: true,
                    title: '網頁可以離線使用了!',
                    timer: 7000,
                    position: 'bottom',
                    showConfirmButton: false,
                    timerProgressBar: true,
                    icon: 'success',
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })
        }
    }

    navigator.serviceWorker.register('worker.js')
        .then(worker => {
            if(worker.active)
                worker.active.addEventListener('message', (message) => {
                    console.log(message)
                })
        })
}

window.addEventListener('appinstalled', () => {
    Swal.fire({
        title: '恭喜你成功安裝離線版App!',
        text: '之後可以更方便的使用計算機拉',
        icon: 'success'
    })
})

if(!localStorage.getItem('denyInstall')) {
    window.addEventListener('beforeinstallprompt', async (e) => {
        e.preventDefault()

        let result = await Swal.fire({
            title: '要不要安裝離線版App方便使用?',
            icon: 'question',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: '好!',
            confirmButtonColor: '#00D100',
            denyButtonText: '不要再問我',
            cancelButtonText: '下次再說'
        })

        if(result.isDismissed)
            return

        if(result.isDenied) {
            let secondConfirm = await Swal.fire({
                title: '你確定不要安裝嘛',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '我要!',
                confirmButtonColor: '#00D100',
                cancelButtonText: '不要'
            })

            if(!secondConfirm.isConfirmed)
                return localStorage.setItem('denyInstall', 'true')
        }

        e.prompt()
    })
}