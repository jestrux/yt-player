import React from 'react'
import logo from "../../yt-logo.png";
import SearchBar from '../search_bar';

const NavBar = ( props ) => {
    return ( 
        <div id="navBar">
            <img src={logo} alt=""/>
            <SearchBar place="detail" placeholder="Search youtube" onSearchTermChange={ props.onSearchVideo }/>
            
            <div id="userDp">
            </div>
        </div>
    );
}
 
export default NavBar;