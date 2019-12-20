import React, { Component } from 'react';
import { Remarkable } from 'remarkable';
import './App.scss';

class App extends Component {
  state = {
    markdownHTML: ""
  }

  markdownText = "";

  /**
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e
   */
  onChange = (e) => {
    this.markdownText = e.target.value;

    const md = new Remarkable({
      linkify: true
    });
    this.setState({
      markdownHTML: md.render(this.markdownText)
    });
  };

  render() {
    const { markdownHTML } = this.state;
    return (
      <div className="App container">
        <div className="content">
          <div className="left">
            <textarea
              name="markdownText"
              id=""
              onChange={this.onChange}>

            </textarea>
          </div>

          <div className="right">
            <div
              dangerouslySetInnerHTML={{ __html: markdownHTML }}></div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
