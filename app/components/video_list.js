import React from 'react'
import VideoListItem from './video_list_item'

const VideoList = (props) => {
    function handleVideoClicked(index, item){
        const videos = document.querySelectorAll('#videoList .video-list-item');
        const fromItem = videos[index];

        console.log("Vide clicked: ", fromItem, item);

        props.onItemSelect({ el: fromItem, item });
    }
    return (
        <div id="videoList">
            <div>
                {
                    props.items.map((item, index) => {
                        return (
                            <div key={index + "" + item.id} className={'video-item-wrapper ' + ( item.type === 'channel' ? 'channel' : '')}>
                                { item.type === "video" && 
                                    <button className="add-btn" onClick={() => props.onAddVideo(item)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                                    </button>
                                }
                                
                                <VideoListItem 
                                    onClicked={() => handleVideoClicked(index, item)}
                                    key={item.id}
                                    video={item} />
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default VideoList