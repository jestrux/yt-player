import React from 'react'

const VideoListItem = ({ video, wide, onClicked }) => {
    const { image, title, subtitle } = video;
    const limit = wide ? 80 : 50;
    let titleString = title.substr(0, limit) + (title.length > limit ? '...' : '');

    return (
        <div onClick={ onClicked } className="video-list-item">
            <div className="video-list-item-thumb">
                <img src={image} alt={title} />
            </div>
            { title && 
                <div className={ !wide ? 'video-list-item-caption' : 'video-list-item-text' }>
                    <span dangerouslySetInnerHTML={{ __html: titleString }}></span>
                    <span>{subtitle}</span>
                </div>
            }
        </div>  
    )
}
 
export default VideoListItem;