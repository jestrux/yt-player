import React from 'react';
import logo from "../../yt-logo.png";
import bg from "./bg.jpg";

import _ from 'lodash'
import YTSearch from '../../Search'
import SampleVideos from "./videos";
import Loader from '../Loader';

import SearchBar from '../search_bar';
import Categories from '../Categories';
import VideoList from '../video_list';

class Home extends React.Component {
    state = { searching: false, videos: [] }

    componentDidMount = () => {
        // console.log(SampleVideos);
    }

    onSearchTermChange = (term) => {
        this.setState({videos: []});
        if(!term || !term.length){
            return;
        }
        this.setState({searching: true});
        YTSearch({key: this.props.apikey, term: term, maxResults: 50}, videos => {
            console.log("Videos result: ", videos);
            this.setState({videos, searching: false});
        })
    }

    render() {
        const searchVideo = _.debounce((term) =>this.onSearchTermChange(term), 500);
        const { videos, searching } = this.state;

        return (
            <div id="home" style={{backgroundImage: 'url('+bg+')'}}>
                <div id="title">
                    <img src={logo} alt=""/>
                    <SearchBar placeholder="Search youtube" onSearchTermChange={ searchVideo }/>
                </div>

                {/* { !videos.length && <Categories apikey={apikey}
                    onCategoryClicked={this.props.onCategoryClicked} /> } */}

                { searching &&
                    <div className="layout center-center">
                        <Loader size="80" />
                    </div>
                }

                { videos.length &&
                    <VideoList items={videos}
                        onAddVideo={this.props.onAddVideo}
                        onItemSelect={this.props.onItemSelect} />
                }
            </div>
        );
    }
}

export default Home;
