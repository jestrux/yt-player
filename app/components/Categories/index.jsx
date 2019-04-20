import React, { Component } from 'react';
import axios from 'axios'
import "./categories.css";

import DefaultCategories from './categories'

class Categories extends Component {
    constructor(props) {
        super(props)
        this.state = { region: 'US', categories: DefaultCategories };
        // this.getCategories(props.apikey);
    }

    getCategories = (key) =>{
        axios.get(`https://www.googleapis.com/youtube/v3/videoCategories?part=snippet,id&regionCode=${this.state.region}&key=${key}`)
        .then(res => {
            const categories = res.data.items;
            this.setState({categories});
            console.log(categories);
            // this.getCategoryVideos(categories[0].id);
        })
        .catch(err => {
            console.log("Categories Fetch error: ", err);
        });
    }

    render() { 
        return ( 
            <div id="categories">
                <div>
                    { 
                        this.state.categories.map((category) => {
                            return (
                                <div key={category.id} className='category-item'>
                                    {category.snippet.title}
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}
 
export default Categories;