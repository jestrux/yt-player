import React from 'react';

import './notifications.css';
import NotificationItem from './NotificationItem';

function _get_event(event){
    return new CustomEvent('ot-notification', event)
}

export const notify = ( message, ...rest ) => {
    const options = rest && rest.length ? rest[0] : {};
    const notification_object = { detail: { message, options: options } };

    document.dispatchEvent( _get_event(notification_object) );
}

class Notifications extends React.Component {
    state = { notifications: [] }
    constructor(props){
        super(props);
        this.wrapper = React.createRef();
    }

    componentDidMount(){
        document.addEventListener('ot-notification', (e) => {
            const _notification = e.detail;
            _notification.id = 'ot-notif-' + Math.random().toString(36).substr(2, 5);

            this.showNotification(_notification)
        }, false);
    }

    showNotification = (_notification) => {
        this.setState({ notifications: [ ...this.state.notifications, _notification] }, () => {
            setTimeout(() => {
                const _notifications = [...this.state.notifications].filter( ( n ) => n.id !== _notification.id);
                this.setState({ notifications: _notifications });
            }, 3000);
        });
    }

    render() { 
        const { notifications } = this.state;
        return ( 
            <div className="ot-notifications-wrapper">
                { notifications.reverse().map( (n, i) => <NotificationItem key={i} notification={n} />) }
            </div>
        );
    }
}
 
export default Notifications;