import React from 'react';
import VideoList from '../video_list';
import YTSearch, { FormatResults } from '../../Search';
import Loader from '../Loader';
import axios from 'axios'

const  API_KEY = 'AIzaSyAq8HPrbemKw4a23McQJD9ksl2w2lGAcII'

class Detail extends React.Component {
    state = { loading: false, entity: {}, which: 'videos' }

    componentDidMount(){
        console.log("Detail props", this.props);
        if(!this.state.entity.id){
            this.setState({entity: this.props.entity}, () => {
                this.fetchVideos()
            });
        }
    }
    
    componentWillReceiveProps(props){
        console.log("Detail props", this.props);
        // if(props.entity && props.entity.id !== this.state.entity.id){
        //     this.setState({entity: this.props.entity}, () => {
        //         this.fetchVideos()
        //     });
        // }
    }

    getChannelVideos = (channelId) =>{
        this.setState({loading: true});
        return new Promise(function(resolve, reject){
            try{
                YTSearch({key: API_KEY, channelId, maxResults: 50}, videos => {
                    resolve(videos);
                });
            }catch(err){
                reject(err);
            }
        })
        // return axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&channelId=${channelId}&chart=mostPopular&maxResults=50&key=${API_KEY}`);
    }

    getChannelPlaylists = () =>{
        this.setState({loading: true});
        axios.get(`https://www.googleapis.com/youtube/v3/playlists?part=snippet%2CcontentDetails&channelId=${this.state.entity.id}&maxResults=50&key=${API_KEY}`)
            .then(res => {
                const videos = FormatResults(res.data.items);
                console.log("Playlists response: ", videos);
                this.setState({ loading: false, entity: { ...this.state.entity, videos } });
            })
            .catch(err => {
                console.log("Playlists Fetch error: ", err);
                this.setState({loading: false});
            });
    }
    
    getPlaylistVideos = () =>{
        this.setState({loading: true, entity: { ...this.state.entity, videos: []}});
        axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&playlistId=${this.state.entity.id}&maxResults=50&key=${API_KEY}`)
            .then(res => {
                const videos = FormatResults(res.data.items);
                console.log("Playlists videos response: ", res.data.items);
                this.setState({loading: false, entity: { ...this.state.entity, videos } });
            })
            .catch(err => {
                console.log("Playlists videos Fetch error: ", err);
                this.setState({loading: false});
            });
    }

    fetchVideos = () => {
        this.setState({entity: { ...this.state.entity, videos: []}});
        if(this.state.which === 'videos'){
            this.getChannelVideos(this.state.entity.id)
                .then(videos => {
                    this.setState({loading: false, entity: { ...this.state.entity, videos } });
                })
                .catch(err => {
                    this.setState({loading: false});
                    console.log("Channel Videos Fetch error: ", err);
                });
        }else if(this.state.which === 'playlists'){
            this.getChannelPlaylists();
        }
    }

    setWhich = () => {
        const which = this.state.which === 'playlists' ? 'videos' : 'playlists';

        this.setState({which}, () => {
            this.fetchVideos();
        });
    }

    handleItemClicked = (...args) => {
        if(this.state.which !== 'playlists' || args[0].item.type === "video"){
            this.props.onItemSelect(...args);
        }else{
            const item = args[0].item;
            this.setState({loading: true, entity: { id: item.id, title: item.title, bg: item.bg, type: item.type, image: item.image} }, () => {
                this.getPlaylistVideos();
            });
        }
    }
    
    render() { 
        const { entity, loading, which } = this.state;
        const { type, title, image, bg, videos } = entity;

        return ( 
            <div id="detail">
                <button id="closeDetail" onClick={ this.props.onCloseDetail }>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                </button>

                <div id="detailHeader" style={ {backgroundImage : `${bg}` } }>
                    <div>
                        <div id="image">
                            <img src={image} alt=""/>
                        </div>
                        <div>
                            <h1>{ title }</h1>

                            <div id="buttons">
                                { type === 'channel' &&
                                    <React.Fragment>
                                        <button className={which === 'videos' ? 'active' : ''}
                                            onClick={this.setWhich}>VIDEOS</button>
            
                                        <button className={which === 'playlists' ? 'active' : ''}
                                            onClick={this.setWhich}>PLAYLISTS</button>
                                    </React.Fragment>
                                }
                                
                                { type === 'playlist' && videos && videos.length > 0 &&
                                    <button onClick={() => this.props.onPlayVideos(videos) }>Play All</button>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div id="detailContent">
                    { videos && videos.length > 0 &&
                        ( <VideoList items={videos}
                            onAddVideo={this.props.onAddVideo}
                            onItemSelect={this.handleItemClicked} /> )
                    }
                    
                    { loading && 
                        <div className="layout center-center">
                            <Loader size="80" />
                        </div>
                    }
                </div>
            </div>
        );
    }
}
 
export default Detail;