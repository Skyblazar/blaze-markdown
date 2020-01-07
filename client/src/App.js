import React, { Component } from 'react';
import { Remarkable } from 'remarkable';
import hljs from 'highlight.js';
import htmlToImage from 'html-to-image';
import './App.scss';

class App extends Component {
  state = {
    markdownHTML: "",
    pdfLoading: false,
    imgLoading: false
  }

  markdownText = "";

  /**
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e
   */
  onChange = (e) => {
    this.markdownText = e.target.value;

    const md = new Remarkable({
      linkify: true,
      breaks: true,
      html: false,
      // langPrefix: 'language-',
      /**
       * @param {string} str
       * @param {string} lang
       */
      highlight(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(lang, str).value;
          } catch (err) {
            console.log(err);
          }
        }

        try {
          return hljs.highlightAuto(str).value;
        } catch (err) {
          console.log(err);
        }

        return '';
      }
    });
    this.setState({
      markdownHTML: md.render(this.markdownText)
    });
  };

  /**
   * @param {string} dataUrl
   * @param {string} contentType
   * @param {number} sliceSize
   */
  b64toBlob = (dataUrl, contentType = 'image/png', sliceSize = 512) => {
    const b64Data = dataUrl.split(',')[1];
    console.log(b64Data);
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  /**
   * @param {string} fileName
   * @param {Blob} blob
   */
  downloadFile = (fileName, blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  }

  /** @param {String} fileType */
  download = (fileType = "pdf") => {
    const loadingKey = `${fileType}Loading`;
    this.setState({ [loadingKey]: true });

    if (fileType === "png") {
      const previewElem = document.getElementById('preview');
      previewElem.style.padding = "1em 2em";
      previewElem.style.backgroundColor = "#f5f5f5";

      htmlToImage.toPng(previewElem)
        .then((dataUrl) => {
          this.setState({ [loadingKey]: false });
          if (dataUrl.length === 0) return;

          previewElem.style.padding = "0";

          this.downloadFile('md_to_png.png', this.b64toBlob(dataUrl));
        });

      return;
    }

    const uniqueLink = Date.now().toString();
    fetch(`http://192.168.43.45:8000/pdf/${uniqueLink}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        md: this.markdownText
      })
    }).then((res) => res.blob().then((blob) => {
      this.setState({ [loadingKey]: false });
      if (blob.size === 0 || blob.type === "") return;

      this.downloadFile('md_to_pdf.pdf', new Blob([blob]));
    }));
  };

  render() {
    const { markdownHTML } = this.state;
    return (
      <div className="app container">
        <div className="content">
          <div className="left">
            <header>
              <span>Text Input</span>

              <div className="download" style={{ opacity: 0 }}>
                <button className="image">
                  Image
                </button>
              </div>
            </header>
            <textarea
              name="markdownText"
              id=""
              placeholder="Type some markdown"
              onChange={this.onChange}>

            </textarea>
          </div>

          <div className="right">
            <header>
              <span>Markdown</span>
              <div className="download">
                <button className="image" onClick={() => this.download("png")}>
                  Image
                </button>
                <button className="pdf" onClick={() => this.download("pdf")}>
                  PDF
                </button>
              </div>
            </header>
            <div className="preview-container">
              <div
                id="preview"
                className="preview"
                dangerouslySetInnerHTML={{ __html: markdownHTML }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
