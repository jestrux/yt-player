import React, { useEffect, useRef } from 'react'
import VideoListItem from '../video_list_item';

const Playlist = ({ curIdx, floating, videos, onVideoClicked, onRemoveVideo }) => {
    const playListRef = useRef(null);

    useEffect(() => {
        if(floating){
            const index = curIdx <= 0 ? 0 : curIdx;
            playListRef.current.scrollTop = (index * 86.7);
        }
    });

    return (
        <div id="playlistWrapper" ref={playListRef}>
            { videos.length < 1 && 
                <div id="emptyMessage">No videos in playlist.</div>
            }
            
            { videos.length > 0 && 
                videos.map((item, index) => {
                    return (
                        <div key={item.id} className={'video-item-wrapper is-wide ' + (index === curIdx ? 'selected' : '')}>
                            <button className="add-btn" onClick={() => onRemoveVideo(index)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                            </button>

                            <VideoListItem video={item} wide
                                onClicked={() => onVideoClicked(index)}
                            />
                        </div>
                    )
                })
            }
        </div>
    );
}
 
export default Playlist;