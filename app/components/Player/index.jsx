import React, { Component } from 'react'
import YouTube from 'react-youtube';

let timeupdater, hovertimeout;

class VideoDetail extends Component {
    player;
    constructor(props) {
        super(props)
        this.state = { video: {}, hovered: false, playing: false, progress: 0, loop: false, floating: false }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.video){
            this.setState({video: nextProps.video, playing: true, progress: 0});
            
            if(nextProps.video.id !== this.state.video.id){
                this.setState({ floating: false }); 
            }
        }
        // this.setState({ notrans: true, floating: false });
        // setTimeout(() => {
        //     this.setState({ notrans: false });
        // }, 500);
    }

    componentDidMount(){
        document.addEventListener("keyup", (e) => {
            this.handleKeyup(e);
            return;
        })
    }

    componentWillMount(){
        document.removeEventListener("keyup", function() {
            return;
        })
    }

    toggleLoop = () => {
        this.setState({ loop: !this.state.loop });
    }
    
    floatPlayer = () => {
        this.setState({ hovered: false, floating: !this.state.floating });
    }
    
    setupPlayer = ({ target }) => {
        this.player = target;
    }

    updateProgress = () => {
        const percent = this.player.getCurrentTime() / this.player.getDuration();
        this.setState({progress: percent * 100});
    }

    togglePlaying = () => {
        const playstate = this.state.playing;

        if(this.player.getCurrentTime() === this.player.getDuration()){
            this.player.seekTo(0);
        }

        if(playstate)
            this.player.pauseVideo();
        else
            this.player.playVideo();

        this.setState({ playing: !playstate });
    }

    handleKeyup = (e) => {
        console.log("On Keyup", e.key);

        if(this.state.floating)
            return;

        switch (e.key) {
            case ' ':
                this.togglePlaying();
                break;
            case 'n':
                this.props.onPlayNext()
                break;    
            case 'p':
                this.props.onPlayPrevious()
                break;
            case 'ArrowRight':
                this.player.seekTo(this.player.getCurrentTime() + 13);
                break;    
            case 'ArrowLeft':
                this.player.seekTo(this.player.getCurrentTime() - 13);
                break;
            case 'r':
                this.toggleLoop()
                break;
            case 'ArrowDown':
                this.player.setVolume(this.player.getVolume() - 0.1);
                break;
            case 'ArrowUp':
                this.player.setVolume(this.player.getVolume() + 0.1);
            break;
            case 'm':
                this.player.isMuted() ? this.player.unMute() : this.player.mute();
            break;

            default:
                return;
        }
    }

    handleMouseMove = () => {
        if(hovertimeout)
            clearTimeout(hovertimeout);

        const waitTime = this.state.floating ? 1500 : 5000;

        this.setState({ hovered: true }, () => {
            hovertimeout = setTimeout(() => {
                this.setState({ hovered: false });
            }, waitTime);
        });
    }
    
    handleFloatApp = () => {
        this.setState({ hovered: false });
        if(this.state.floating){
            this.setState({ floating: false }, () => {
                this.props.onFloatApp()
            });
        }
        else
            this.props.onFloatApp()
    }

    handleVideoEnded = () => {
        clearInterval(timeupdater);

        setTimeout(() => {
            if(this.state.loop){
                this.player.seekTo(0);
            }else{
                this.setState({playing: false});
                this.props.onVideoEnded();
            }
        }, 20);
    }

    handleSeekTo = (e) => {
        const x = e.nativeEvent.offsetX;
        const w = e.nativeEvent.target.clientWidth;
        const per = x / w;
        const time = this.player.getDuration() * per;
        
        this.setState({progress: per * 100});
        this.player.seekTo(time);
    }
    
    handleVideoPlaying = () => {
        this.setState({playing: true});

        timeupdater = setInterval(() => {
            if (this.player.getPlayerState() === 1)
                this.updateProgress();
        }, 100);
    }

    render() {
        const { fullscreen, notrans, video, nofloat, canPrev, canNext } = this.props;
        const { hovered, playing, progress, floating, loop } = this.state;
        // const videoUrl = `https://youtube.com/embed/${id}`
        const config = {
            showinfo: 0,
            color: 'white',
            modestbranding: 1,
            autoplay: 1,
            controls: 0
        }

        const opts = {
            height: '100%',
            width: '100%',
            playerVars: config
        };

        return (
            <div onMouseMove={this.handleMouseMove} className={'video-player ' + (playing ? 'playing ' : '') + (hovered ? 'hovered ' : '') + (notrans ? 'notrans ' : '') + (video ? 'visible ' : '') + (floating ? 'floating' : '')}>
                { !nofloat && !fullscreen &&
                    <React.Fragment>
                        <button id="closeVideo" onClick={ this.props.onClosePlayer }>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                        </button>
                        { !floating &&
                            <button id="floatVideo" className="float-video-btn" onClick={ this.floatPlayer }>
                                { floating && <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z"/></svg> }
                                { !floating && <svg width="24" height="24" viewBox="0 0 24 24"><path d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z"/></svg> }
                            </button>
                        }
                    </React.Fragment>
                }

                {
                    !video && <div>Video loading ...</div>
                }

                { video && <YouTube
                        videoId={video.id}
                        opts={opts}
                        onEnd={ this.handleVideoEnded }
                        onPlay={ this.handleVideoPlaying }
                        onReady={this.setupPlayer}
                    />
                }

                { video && 
                    <div className="player-controls">
                        <div id="playerProgress" onClick={this.handleSeekTo}>
                            <div style={ { width: progress + '%' } } id="progress"></div>
                        </div>

                        { !floating &&
                            <button id="floatAp" onClick={ this.handleFloatApp }>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                            </button>
                        }

                        <span></span>

                        { !floating && <button onClick={ this.props.onToggleFullScreen }>
                                { fullscreen && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg> }
                                { !fullscreen && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg> }
                            </button>
                        }

                        { floating &&
                            <button className="float-video-btn" onClick={ this.floatPlayer }>
                                { floating && <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z"/></svg> }
                                { !floating && <svg width="24" height="24" viewBox="0 0 24 24"><path d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z"/></svg> }
                            </button>
                        }

                        <button className={ !canPrev ? 'disabled' : '' } onClick={ this.props.onPlayPrevious }>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                        </button>

                        <button id="playPause" onClick={ this.togglePlaying }>
                            { playing && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg> }
                            { !playing && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> }
                        </button>

                        <button className={ !canNext ? 'disabled' : '' } onClick={ this.props.onPlayNext }>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                        </button>

                        <button id="loopVideo" className={ loop ? 'active' : '' } onClick={ this.toggleLoop }>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                        </button>

                        <span></span>

                        { !nofloat &&
                            <button onClick={ this.props.onTogglePlaylist }>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                            </button>
                        }
                    </div>
                }
            </div>
        )
    }
}

export default VideoDetail