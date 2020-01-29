import React, { Component } from 'react';
// @ts-ignore
import { Remarkable } from 'remarkable';
import hljs from 'highlight.js';
import htmlToImage from 'html-to-image';
import './App.scss';
import Container from './components/Container';
import Spinner from './components/Spinner';

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

      htmlToImage.toPng(previewElem, {
        backgroundColor: "#f7f7f7",
        imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAAeCAYAAACR82geAAAABHNCSVQICAgIfAhkiAAAAp9JREFUaIHtmT9oFEEUxr/vnRCRKEdQTMDKUm0UyZ3BMgpik1pEBRsLN7lTvEpwFQVJc7teiJpCg4h1QCwUtRLcA0FRFBtBKw8jZo0i4eLms4ly5p8Rk8yq+XUzbx78eMwMu/OIeVAsFluSJNltZrskbSLZJmkdyVXzyXeFpC8k30mqAXhuZncA3C2Xyx9+lcu5gqVSaXW9Xj8D4CiAFQuj65yvAC4kSXK6UqmMzrZotsKwUCgclHSe5PrF8XOLpBrJUhAE1wFoajwzU1JPT88JAH0kmxdb0BUkmyV1dXR0xFEUVafFGwe+79vIyMhVkgeWTjEVBNls9rjv+xPfJ6wxGsdx939YFAAoxHHc3TjxY8cUi8VOSbcxpVj/ERMk95TL5TvAZGE8z2syszf/6kX7G7yN43jj4ODgmAEAyeJyUQAAbdls9ggweWxI9rj1SRUlAKDneflMJvPQtU2aSJJkh5lZl2uRtGFmXUYy71okbZDMm6RW1yJpQ1KrkVwuzBRItpqkla5F0oiRrLmWSBuSajb5iLNMAyRrBuCJa5G0IemlSRpyLZI2JA1ZS0vLfQAfXcukBUmjY2Nj98z3/bqkS66FUsTFgYGBcQOApqamc5KGXRu5RtLw+Pj4WWDy77q3t/eTme0HMDFn5r/NhJnt6+/v/ww0PIZHUfSqvb29TrLTnZtTjgVBcOP74KcuQbVafZDP5zcA2LbkWg6RdDkMw5ONc9PaJ1EU3czlcp8B7CI5Z0Pub0eSSHphGJ6aGpuxr1StVh/mcrmnJHcCWLPohm54LelwGIbXZgr+ckcUCoVDkrpJbl14t6VH0mOSfUEQXJlr3byPiud56zKZzF4A2wFsAbAZwNo/01x03kt6QfIZgEdJktyqVCrz+iz5Bt+l8l7rKvG3AAAAAElFTkSuQmCC"
      })
        .then((dataUrl) => {
          this.setState({ [loadingKey]: false });
          if (dataUrl.length === 0) return;

          previewElem.style.padding = "0";

          this.downloadFile('md_to_png.png', this.b64toBlob(dataUrl));
        });

      return;
    }

    const uniqueLink = Date.now().toString();
    const host = process.env.NODE_ENV === "development" ? "http://192.168.43.45:8000" : "";
    fetch(`${host}/pdf/${uniqueLink}`, {
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
    const { markdownHTML, pdfLoading, imgLoading } = this.state;
    return (
      <Container className="app">
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
                {
                  imgLoading ? <Spinner /> : (
                    <button className="image" onClick={() => this.download("png")}>
                      Image
                    </button>
                  )
                }
                {
                  pdfLoading ? <Spinner /> : (
                    <button className="pdf" onClick={() => this.download("pdf")}>
                      PDF
                    </button>
                  )
                }
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
      </Container>
    );
  }
}

export default App;
