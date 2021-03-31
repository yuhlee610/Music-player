const $$ = document.querySelectorAll.bind(document)
const $ = document.querySelector.bind(document)

const PLAYER_STORAGE_KEY = 'PLAYER'


const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
var startEvent = "ontouchstart" in document.documentElement ? "touchstart" : "mousedown";
                
                
            

const app = {
    isPlaying: false,
    currentIndex: 0,
    isChangeProgress: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs : [
        {
            name: 'Can I Have the Day With You',
            singer: 'Michelle',
            path: './assets/song/Can I Have the Day With You - Sam Ock_ M.mp3',
            image: './assets/img/image.jpg'
        },
        {
            name: 'Blind to you',
            singer: 'Aimer',
            path: './assets/song/BlindToYou-Aimer-6061690.mp3',
            image: './assets/img/image2.jpg'
        },
        {
            name: 'Goodnight and Goodbye',
            singer: 'Mree',
            path: './assets/song/Goodnight And Goodbye - Mree.mp3',
            image: './assets/img/image3.jpg'
        },
        {
            name: 'Hindenburg Lover',
            singer: 'Anson Seabra',
            path: './assets/song/Hindenburg Lover - Anson Seabra.mp3',
            image: './assets/img/image4.png'
        },
        {
            name: "I can't carry this anymore",
            singer: 'Anson Seabra',
            path: './assets/song/ICanTCarryThisAnymore-AnsonSeabra-6785676.mp3',
            image: './assets/img/image5.jpg'
        },
        {
            name: 'Our first song',
            singer: 'Joseph Vincent',
            path: './assets/song/OurFirstSong-JosephVincent-4663459.mp3',
            image: './assets/img/image6.jpg'
        }
    ],
    render: function(){
        const _this = this
        const htmls = this.songs.map(function(song, index) {
            return `
                <div class="song ${index === _this.currentIndex ? 'active' : ''}" data-index=${index}>
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });
        playlist.innerHTML = htmls.join('\n');
    },
    // set property cho object 
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvent: function() {
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Cho hình đĩa quay
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xu ly event srcoll
        // Thu nhỏ cd và làm mờ
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const cdNewWidth = cdWidth - scrollTop;

            cd.style.width = cdNewWidth > 0 ? cdNewWidth + 'px' : 0;
            cd.style.opacity = cdNewWidth / cdWidth; 
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
                cdThumbAnimate.pause()
            }
            else {
                audio.play();
                cdThumbAnimate.play()
            }
        }

        // Khi song dc play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
        }

        // Khi song bi pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(!_this.isChangeProgress && audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
                // console.log('ontimeupdate', _this.isChangeProgress)
            }
        }

        // Khi tua tiến độ bài hát
        progress.onchange = function(e) {
            // Ngăn thay đổi tiến độ bài hát
            _this.isChangeProgress = false
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime     
            // console.log('onchange', _this.isChangeProgress)   
        }

        // Khi mouse up progress
        progress.addEventListener(startEvent, function() { 
            // Cho phép thay đổi tiến độ bài hát khi tua xong
            _this.isChangeProgress = true
            // console.log('mousedown',_this.isChangeProgress)
        } )


        // Khi next song
        nextBtn.onclick = function () {
            _this.isChangeProgress = false
            if(_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.nextSong();
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi prev song
        prevBtn.onclick = function () {
            _this.isChangeProgress = false
            if(_this.isRandom) {
                _this.playRandomSong()
            }
            else {
                _this.prevSong();
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi click random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)            
        }

        // Repeat song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Khi hết bài hát
        audio.onended = function() {
            
            if(_this.isRepeat) {
                // console.log(_this.isRepeat)
                audio.play()
            }
            else {
                nextBtn.click()
            }
        }

        // Lắng nghe khi click vào bài hát trong playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')

            // Xử lý khi click vào bài hát
            if(songNode || e.target.closest('.option')) {
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },
    loadConfig: function() {
        // lấy config và gán vào config hiện tại
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        repeatBtn.classList.toggle('active', this.isRepeat)
        randomBtn.classList.toggle('active', this.isRandom) 
    },
    // scroll view đến bài hát đang phát
    scrollToActiveSong: function() {
        setTimeout(() => {
            if(this.currentIndex < 3) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }
            else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            }
        },280)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();  
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();  
    },
    playRandomSong: function() {
        let newIndex
        if(this.songs.length === 1) {
            newIndex = this.currentIndex
        }
        else {
            do {
                newIndex = Math.floor(Math.random() * this.songs.length)
            }
            while (newIndex === this.currentIndex)
        }
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() {
        // Thiết lập các config đã cài
        this.loadConfig();

        // Định nghĩa thuộc tính cho object
        this.defineProperties();

        // Lắng nghe & xử lý các sự kiện (DOM)
        this.handleEvent();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();
    }
} 

app.start();

              
