import React, { Component } from "react";
import Image from "../Image";
import API from "../../utils/API";
import "./Main.css";

class Main extends Component {

    pageSize = 12;
    // Clicky Photo URLs come from the Giphy API (200px width size).
    // Store the clicked URLs in an array for game logic to use.
    // There are 2 possible values for status: blank and shake.
    state = {
      clickyImages: ["https://media.giphy.com/media/l2QEgAHt1gPBLIfp6/200w",
                     "https://media.giphy.com/media/3oFzmmRkQiiE7rDrsQ/200w",
                     "https://media.giphy.com/media/wJNGA01o1Zxp6/200w",
                     "https://media.giphy.com/media/3o7aCXPFJevWPrWSru/200w",
                     "https://media.giphy.com/media/l44Q7lmy0QVQVbIm4/200w",
                     "https://media.giphy.com/media/3o7btT1T9qpQZWhNlK/200w",
                     "https://media.giphy.com/media/XBlty0CRVhxeM/200w",
                     "https://media.giphy.com/media/2MmlCYRzGZwkg/200w",
                     "https://media.giphy.com/media/l0IyaInBwoLwPbWLu/200w",
                     "https://media.giphy.com/media/l396O8kn1qbPcb4ha/200w",
                     "https://media.giphy.com/media/l0O9zareSGZoeC7gk/200w",
                     "https://media.giphy.com/media/xUOxeZc41DVT2l9laU/200w"],
      alreadyClicked: [],
      status: "",
      offset: 0
    };

    // Removes the shake class after the animation is complete.
    handleAnimation = (event) => {

      this.setState({
        status: ""
      });
    };

    // Extract the Giphy API call data and format the array.
    processURLs = (array) => {

      let newArray = [];
      for(let i=0; i < 12; i++){
        newArray.push("https://media.giphy.com/media/"+array[i].id+"/200w");
      }

      return newArray;
    }

    // Shuffle array of URLs.
    shuffle = () => {

      let array = this.state.clickyImages;

      for(let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }

      this.setState({clickyImages: array});
    }

    // Adds the animationend event listener, the handleAnimation function.
    componentDidMount() {
 
      const element = this.refs.mainDiv;
      element.addEventListener("animationend", this.handleAnimation);
    }

    componentWillReceiveProps(nextProps){
      // There are only 12 images.
      // Reset the game and add new images.
      if(nextProps.score === 12 &&
         nextProps.status === "correct"){
        // You won. Game over.
        this.props.handleReset(true);
        // Query the Giphy API for the next set of trending gifs.
        // The first query will use offset = 0.
        API.getTrending(this.pageSize, this.state.offset)
        .then(res => {
          // Process the results.
          let newData = this.processURLs(res.data.data);
          this.setState({ clickyImages: newData,
                          alreadyClicked: [] });
          // Increment the offset for the next game.
          if( this.state.offset + this.pageSize + 1 < res.data.pagination.total_count ){

              this.setState( (prevState) => {
                return {
                  offset: prevState.offset + this.pageSize + 1
                };
              });
          } else {

              this.setState( (prevState) => {
                return {
                  offset: 0
                };
              });
          }
          
        })
        .catch(err => console.log(err));
      } else {
        // Shuffle the array of URLs.
        this.shuffle();
      }
    }

    // When an image/video is clicked update the state.
    handleImgClick = (event) => {

      event.preventDefault();

      // Reference to the Image component via name property.
      const key = event.target.attributes.getNamedItem("name").value;

      // If already clicked, then game must be reset.
      const clickedAlready = this.state.alreadyClicked.includes(key);
      if(clickedAlready){

        // Reset handled by App component.
        this.props.handleReset(false);
        // Then add the shake class to the Main component.  
        this.setState({alreadyClicked: [], status: "shake"});

      } else{

        // Score udate handled by App component.     
        this.props.handleScore();

        //  Add the URL to the alreadyClicked array.
        let newArray = this.state.alreadyClicked;
        newArray.push(key);
        this.setState({alreadyClicked: newArray});
      }

    };

    // Returns an array of Image components wrapped in divs.
    // Pass the handleImgClick function in props.
    render() {

      return(
            <main ref="mainDiv" className={`main container ${this.state.status}`}>
              <div className="row">
                {this.state.clickyImages.map( (url) => {
                  return(
                    <div className="col col-6 col-lg-3" key={url}>
                      <Image handleImgClick={this.handleImgClick} url={url} />
                    </div>);
                  }
                )}
              </div>
            </main>);
    }
}

export default Main;