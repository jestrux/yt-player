import React, { Component } from 'react';
import SpeechToText from 'speech-to-text';

import logo from './logo.svg';
import './Speech.css';

let listener;
class Speech extends Component {
  state = {
    listening: false,
    query: null
  }

  componentDidMount = () => {
    try {
      listener = new SpeechToText(this.onAnythingSaid, this.onFinalised, this.onFinishedListening);
      listener.startListening();
      console.log("Speech detect active");
    } catch (error) {
      console.log("Speech detect error: ", error);
    }
  }

  onAnythingSaid = text => {
    this.setState({query: text + '...', listening: true});
    console.log(`Interim text: ${text}`)
  };

  onFinalised = text => {
    this.setState({query: text, listening: false});
    console.log(`Finalised text: ${text}`);

    // listener.stopListening();

    // setTimeout(() => {
    //   listener.startListening();
    // }, 10);
  };
  
  onFinishedListening = () => {
    this.setState({listening: false, query: null});
    console.log('Done listening:');
  };

  render() {
    const { query, listening } = this.state;
    return (
      <div className={'Speech ' + (listening ? 'user-is-talking' : '')}>
        <header className="Speech-header">
          <img src={logo} className="Speech-logo" alt="logo" />
          <p>
            { query ? query : <i>Say something to search...</i> }
          </p>
        </header>
      </div>
    );
  }
}

export default Speech;
