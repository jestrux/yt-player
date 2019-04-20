import React, { Component } from 'react'
import axios from 'axios'

// import PropTypes from 'prop-types';
import Home from './components/Home';

import Player from "./components/Player";
import PlayList from "./components/PlayList";
import Detail from "./components/Detail";
import Notifications, { notify } from './components/Notifications';
import { toggleFloat, toggleFullScreen, getAuthUser, signIn, signOut } from './Bridge';

// import './index.css';
// import "./App.css";

const  API_KEY = 'AIzaSyAq8HPrbemKw4a23McQJD9ksl2w2lGAcII'

class App extends Component {
    // static contextTypes = {
    //     socket: PropTypes.object.isRequired
    // }
    state = {authUser: undefined, authenticating: false, videos: [], fullscreen: false, playlist: [], curIdx: -1, curVideo: null, showingPlaylist: false, entity: {}, region: 'US', selectedVideo: null}

    async componentDidMount(){
        try {
            const authUser = await getAuthUser();
            this.setState({authUser});
        }
        catch (error) {
            console.log("Failed to get user", error);
            this.setState({authUser: null});
        }
    }

    getLocation = () => {
        navigator.geolocation.getCurrentPosition( position => {
            console.log("Current position: ", position);

            axios({
                method:'get',
                url:`http://api.geonames.org/extendedFindNearbyJSON?lat=${position.coords.latitude}&lng=${position.coords.longitude}&username=jestrux`,
                responseType:'json'
            })
            .then(res => {
                // console.log("Country response: ", res.data.geonames[2].countryCode);
                // response.data.pipe(fs.createWriteStream('ada_lovelace.jpg'))
                this.setState({region: res.data.geonames[2].countryCode}, () => {
                    this.getPopularVideos();
                })
            })
            .catch(err => {
                console.log("Country error: ", err);
            });
        });
    }

    getPopularVideos = () =>{
        axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=${this.state.region}&maxResults=50&key=${API_KEY}`)
        .then(res => {
            const videos = res.data.items;
            // console.log("YT response: ", videos);
            this.setState({videos, selectedVideo: videos[0]});
        })
        .catch(err => {
            console.log("YT Fetch error: ", err);
        });
    }

    getCategoryVideos = (videoCategoryId) =>{
        axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&videoCategoryId=${videoCategoryId}&chart=mostPopular&maxResults=50&key=${API_KEY}`)
        .then(res => {
            const videos = res.data.items;
            console.log("Category Videos response: ", videos);
            // this.setState({videos, selectedVideo: videos[0]});
        })
        .catch(err => {
            console.log("Category Videos Fetch error: ", err);
        });
    }

    handleSignIn = async () => {
        this.setState({authenticating: true});
        try {
            const authUser = await signIn();
            this.setState({authUser, authenticating: false});
        }
        catch (error) {
            console.log("Failed to get user", error);
            this.setState({authUser: null, authenticating: false});
        }
    }

    handleSignOut = () => {
        console.log("Signing out...");
        this.setState({authUser: null});
        signOut();
    }

    flipItem = (from, to, back) => {
        const fromBox = from.getBoundingClientRect();
        const toBox = to.getBoundingClientRect();

        let translateX = fromBox.left - toBox.left;
        let translateY = fromBox.top - toBox.top;

        if(back){
            // translateX *= -1;
            translateY *= -1;
        }

        const translate = 'translate('+translateX + 'px, ' + translateY +'px)';

        const scaleX = fromBox.width / toBox.width;
        const scaleY = fromBox.height / toBox.height;
        const scale = 'scale('+scaleX + ', ' + scaleY + ')';

        const transform = translate + ' ' + scale;
        to.style.transform = transform;

        setTimeout(() => {
            to.classList.add('animated-tile');
            to.style.transform = 'none';

            to.addEventListener('transitionend', () => {
                to.classList.remove('animated-tile');
            })
        }, 10);
    }

    handleItemSelect = ({el, item}) => {
        // this.setState({selectedVideo: video});
        if(item && item.type && item.type === "video"){
            this.setState({playlist: [...this.state.playlist, item]}, () => {
                this.playVideo(this.state.playlist.length - 1);
            });
        }else{
            this.setState({entity: { id: item.id, title: item.title, bg: item.bg, type: item.type, image: item.image, loading: true } });
        }
    }

    handlePlayVideos = (videos) => {
        const startIndex = this.state.playlist.length;
        this.setState({playlist: [...this.state.playlist, ...videos]}, () => {
            notify('Videos added to playlist!');
            this.playVideo(startIndex);
        });
    }

    handleAddVideo = (item) => {
        this.setState({playlist: [...this.state.playlist, item]}, () => {
            notify('Video added to playlist!');

            if(this.state.playlist.length === 1)
                this.playVideo(0);
        });
    }

    toggleFullScreen = () => {
        this.setState({fullscreen: !this.state.fullscreen}, () => {
            toggleFullScreen(this.state.fullscreen);
        });
    }

    floatApp = () => {
        if(this.state.fullscreen){
            this.toggleFullScreen()
        }

        this.setState({floating: !this.state.floating}, () => {
            toggleFloat()
        });
    }

    playVideo = (index) => {
        if(this.state.playlist.length && index < this.state.playlist.length)
            this.setState({curIdx: index, curVideo: this.state.playlist[index]});
    }

    togglePlaylist = () => {
        if(!this.state.showingPlaylist)
            this.showPlaylist();
        else
            this.hidePlaylist()
    }

    showPlaylist = () => {
        this.setState({showingPlaylist: true});
    }

    hidePlaylist = () => {
        this.setState({showingPlaylist: false});
    }

    removeVideoFromPlaylist = (index) => {
        if(index < 0 || index >= this.state.playlist.length)
            return;

        var playlist = this.state.playlist;
        playlist.splice(index, 1);

        this.setState({playlist}, () => {
            notify('Video removed from playlist!');
            const curIdx = this.state.curIdx;
            this.setState({curIdx: curIdx > index ? curIdx - 1 : curIdx});
        });
    }

    closeDetail = () => {
        this.setState({entity: null});
    }

    playPrevious = () => {
        if(this.state.curIdx !== 0){
            const newIdx = this.state.curIdx - 1;
            this.setState({curIdx: newIdx, curVideo: this.state.playlist[newIdx]});
        }
    }

    playNext = () => {
        if(this.state.curIdx !== this.state.playlist.length - 1){
            const newIdx = this.state.curIdx + 1;
            this.setState({curIdx: newIdx, curVideo: this.state.playlist[newIdx]});
        }
    }

    closePlayer = () => {
        this.setState({playlist: [], curIdx: -1, curVideo: null});
    }

    onJoin = (id) => {
        console.log("A new user joined in: ", id);
    }

    onLeft = (id) => {
        console.log("A user has left: ", id);
    }

    render() {
        const { authUser, authenticating, fullscreen, floating, playlist, showingPlaylist, curIdx, curVideo, entity }= this.state;

        return (
            <div id="app" className={floating ? 'floating' : ''}>
                {/* <Event event='NEW_USER' handler={this.onJoin} />
                <Event event='USER_LEFT' handler={this.onLeft} /> */}
                <Notifications />

                { authUser !== undefined &&
                    <div id="authUser">
                        <div>
                            { authUser === null &&
                                <button className={ authenticating ? 'authenticating' : ''}
                                    onClick={ this.handleSignIn }>
                                    { authenticating ? 'SIGNING IN...' : 'SIGN IN' }
                                </button>
                            }
                            { authUser !== null &&
                                <button id="profile" onClick={ this.handleSignOut }>
                                    <img src={authUser.picture} alt=""/>
                                    <p>{ authUser.name }</p>
                                </button>
                            }
                        </div>
                    </div>
                }

                <Home apikey={ API_KEY }
                    onCategoryClicked={this.getCategoryVideos}
                    onAddVideo={this.handleAddVideo}
                    onItemSelect={this.handleItemSelect} />

                { entity && entity.title &&
                    <Detail entity={entity}
                        onItemSelect={this.handleItemSelect}
                        onAddVideo={this.handleAddVideo}
                        onPlayVideos={this.handlePlayVideos}
                        onCloseDetail={ this.closeDetail }/> }

                { curVideo &&
                    <Player video={curVideo}
                        fullscreen={fullscreen}
                        nofloat={floating}
                        canPrev={ curIdx !== 0 }
                        canNext={ curIdx !== playlist.length - 1 }
                        onTogglePlaylist={this.togglePlaylist}
                        onPlayPrevious={this.playPrevious}
                        onPlayNext={this.playNext}
                        onVideoEnded={this.playNext}
                        onFloatApp={ this.floatApp }
                        onToggleFullScreen={ this.toggleFullScreen }
                        onClosePlayer={ this.closePlayer } />
                }

                <div id="mainPlaylist" className={showingPlaylist ? 'visible' : ''}>
                    <div id="playlistHeader">
                        <button onClick={this.hidePlaylist}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                        </button>
                    </div>
                    <PlayList videos={playlist}
                        curIdx={curIdx}
                        floating={floating}
                        onRemoveVideo={ this.removeVideoFromPlaylist }
                        onVideoClicked={this.playVideo} />
                </div>
            </div>
        )
    }
}

export default App;
