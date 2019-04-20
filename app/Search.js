var axios = require('axios');
var _ = require('lodash');

var ROOT_URL = 'https://www.googleapis.com/youtube/v3/search';

export const FormatResults = function(results){
  return _.map(results, (res) => {
    const kind = res.id.kind || res.kind;
    const thumbs = res.snippet.thumbnails;

    let result = {
        type: "unknown"
    };

    if(thumbs){
      result.bg = thumbs.default.url;
      if(thumbs.high)
          result.image = thumbs.high.url;
      // else if(thumbs.medium)
      //     result.image = thumbs.medium.url;
      // else
      //     result.image = thumbs.default;
    }

    if(kind === "youtube#channel"){
        result.type = "channel"
        result.id = res.id.channelId;
        result.title = res.snippet.channelTitle;
        result.description = res.snippet.description;
    }
    else if(kind === "youtube#video"){
        result.type = "video"
        result.channelId = res.snippet.channelId;
        result.channel = res.snippet.channelTitle;
        result.title = res.snippet.title;
        result.subtitle = res.snippet.channelTitle;
        result.id = res.id.videoId;
    }
    else if(kind === "youtube#playlistItem"){
        result.type = "video"
        result.channelId = res.snippet.channelId;
        result.channel = res.snippet.channelTitle;
        result.title = res.snippet.title;
        result.subtitle = res.snippet.channelTitle;
        result.id = res.contentDetails.videoId;
    }
    else if(kind === "youtube#playlist"){
        result.type = "playlist"
        result.title = res.snippet.title;

        if(res.contentDetails){
          result.subtitle = res.contentDetails.itemCount + ' video';
          result.subtitle += res.contentDetails.itemCount !== 1 ? 's' : '';
        }
        result.id = res.id;
    };

    return result;
  });
}

export default function (options, callback) {
  if (!options.key) {
    throw new Error('Youtube Search expected key, received undefined');
  }

  var params = {
    part: 'snippet',
    key: options.key,
    q: options.term,
    type: options.type,
    channelId: options.channelId,
    maxResults: options.maxResults
  };

  axios.get(ROOT_URL, { params: params })
    .then(function(response) {
      const results = response.data.items;
    //   return console.log(results);
      const search_results = FormatResults(results);
      if (callback) { callback(_.filter(search_results, item => {
          return item.title && item.title.length && item.image && item.image.length
      })) }
    })
    .catch(function(error) {
      console.error(error);
    });
};
