import React from 'react';

const Loader = ({className, ...props}) => {
    let color = props.color || '#555';
    var thickness = props.thickness || '5';
    var size = props.size || '60';
    size += 'px';
    return ( 
        <svg className={className} width={size} height={size}  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" style={ { background: 'none'} }><circle cx="50" cy="50" fill="none" stroke={color} strokeWidth={thickness} r="35" strokeDasharray="164.93361431346415 56.97787143782138" transform="rotate(269.874 50 50)"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animateTransform></circle></svg>
    );
}
 
export default Loader;