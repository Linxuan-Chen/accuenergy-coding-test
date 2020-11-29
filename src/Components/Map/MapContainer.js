/*
 * @Author: Linxuan Chen
 * @Date: 2020-11-27 20:17:35
 * @LastEditTime: 2020-11-29 00:01:05
 * @Description: Container component to fetch data from google map services.
 * @FilePath: \repository\accuenergy-coding-test\src\Components\MapDisplay\MapContainer.js
 */
import React, { PureComponent } from "react";
import Map from "./Map";
import TimeContainer from "./Time/TimeContainer";
import { myAPIKey, initialLocation, mapStyle } from "../../Utils/Constants";
import style from "./Map.module.scss";
import { Loader } from "@googlemaps/js-api-loader";

//Loading google map using googlemaps js-api-loader
const GoogleMapLoader = new Loader({
  apiKey: myAPIKey,
  language: "English",
});

//Containers for instances created by google built-in constructors
let GoogleMap, MyMarker, MyGeocoder, MyInfoWindow;

export default class MapContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      markerPosition: initialLocation,
      searchKeyword: "",
      clientLocation: null,
      selectedLocation: initialLocation,
    };
  }

  componentDidMount() {
    //Requesting data from google map server
    GoogleMapLoader.load().then(() => {
      //Initialize the map with default arguments
      GoogleMap = new window.google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
        zoom: 15,
      });
      //Pin a marker at initial location
      MyMarker = new window.google.maps.Marker({
        position: this.state.markerPosition,
        map: GoogleMap,
      });
      //Add a click event to markers to control invisibility of info windows
      MyMarker.addListener("click", () => {
        MyInfoWindow.open(GoogleMap, MyMarker);
      });

      //Create instances of Geocoder and Info Window and initialize them.
      MyGeocoder = new window.google.maps.Geocoder();
      MyInfoWindow = new window.google.maps.InfoWindow({
        content: "2 Lansing Square #700, North York, ON M2J 4P8, Canada",
      });
      //Open info window by default
      MyInfoWindow.open(GoogleMap, MyMarker);
    });
    //Get client location information from navigator
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.setState({
          clientLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      });
    }
  }

  //Triggered when search button is clicked
  onSearchClick = () => {
    if (this.state.searchKeyword !== "") {
      //Clear existed markers
      MyMarker.setMap(null);
      //Request details about keyword searched
      MyGeocoder.geocode(
        {
          address: this.state.searchKeyword,
        },
        (results, status) => {
          // if status is ok, create a new marker according to coordinates obtained from geocoder, relocate to the place, and open a info window by default
          if (status === "OK") {
            MyMarker = new window.google.maps.Marker({
              position: results[0].geometry.location,
              map: GoogleMap,
            });
            GoogleMap.setCenter(results[0].geometry.location);
            MyInfoWindow = new window.google.maps.InfoWindow({
              content: results[0].formatted_address,
            });
            MyInfoWindow.open(GoogleMap, MyMarker);
            this.setState({
              selectedLocation: {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng(),
              },
            });
          } else {
            alert(
              "Didn't get response about current keyword from google map server. Please check you network or change another keyword and try again."
            );
          }
        }
      );
    }
  };
  onKeyUpHandler = (e) => {
    if (e.keyCode === 13) {
      this.onSearchClick();
    }
  };

  //onChange event to monitor the variation of value in the input box
  onSearchKeywordChange = (e) => {
    this.setState({
      searchKeyword: e.target.value,
    });
  };

  //
  onYourLocationClick = () => {
    MyMarker.setMap(null);
    //Request for details about client location.
    MyGeocoder.geocode(
      {
        latLng: this.state.clientLocation,
      },
      (result, status) => {
        if (status === "OK") {
          //Center the map at client location
          GoogleMap.setCenter(this.state.clientLocation);
          this.setState({
            selectedLocation: this.state.clientLocation,
          });
          //Create a new marker on client location
          MyMarker = new window.google.maps.Marker({
            position: this.state.clientLocation,
            map: GoogleMap,
          });
          //Create a new Info Window about client location, and open it by default
          MyInfoWindow = new window.google.maps.InfoWindow({
            content: `
            <h3>Your Location</h3>
            <p>${result[0].formatted_address}</p>
            `,
          });
          MyInfoWindow.open(GoogleMap, MyMarker);
          //Add a click event to markers to control invisibility of info windows
          MyMarker.addListener("click", () => {
            MyInfoWindow.open(GoogleMap, MyMarker);
          });
        } else {
          alert(
            "Didn't get response about client location from google map server. Please enable location services on your browser first and try again."
          );
        }
      }
    );
  };
  render() {
    return (
      <>
        <TimeContainer
          selectedLocation={this.state.selectedLocation}
          myAPIKey={myAPIKey}
        />
        <Map
          mapStyle={mapStyle}
          onSearchClick={this.onSearchClick}
          onSearchKeywordChange={this.onSearchKeywordChange}
        >
          <input
            className={style.search_box}
            type="text"
            onChange={this.onSearchKeywordChange}
            onKeyUp={this.onKeyUpHandler}
          />
          <button className={style.buttons} onClick={this.onSearchClick}>Search</button>
          <button className={style.buttons} onClick={this.onYourLocationClick}>Your Location</button>
          <div>{this.state.utcTime}</div>
        </Map>
      </>
    );
  }
}
