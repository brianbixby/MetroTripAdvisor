import React, { Component } from 'react';
import Navbar from './Navbar';
import ShowMap from './showMap';
import Polyline from "polyline";
import $ from "jquery";

class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      agencies: [],
      routes: [],
      routeId: "",
      searchTerm: "",
      routeStops:null
    };
    this.performAgencyAPIRequest();
  }

  performAgencyAPIRequest() {
    fetch(`/api/agencies-with-coverage`)
    .then(response => {
      response.json().then(data => {
        console.log('data',data);
        this.setState({agencies: data.data.references.agencies}, this.performRouteAPIRequests);
        console.log('agencies',this.state.agencies);
      });
    }).catch(error => {
      this.setState({agencies: null});
    });
  }

  performRouteAPIRequests() {
    for (var i = 0; i < this.state.agencies.length; i++) {
      const agencyId = this.state.agencies[i].id;
      window.setTimeout(() => this.performRouteAPIRequest(agencyId), i*200);
    }
  }

  performRouteAPIRequest(agencyId) {
    fetch(`/api/routes-for-agency/` + agencyId)
      .then(response => {
        response.json().then(data => {
          for (var j = 0; j < data.data.list.length; j++) {
            this.state.routes.push(data.data.list[j]);
          }
          this.setState({routes: this.state.routes});
        });
      }).catch(error => {
        this.setState({routes: null});
      });
  }

  searchChange(e) {
    this.setState({searchTerm: e.target.value});
  }

  getRouteStop() {
    if(this.state.routeId !== ""){
      fetch(`/api/stops-for-route/` + this.state.routeId)
      .then(response => {
        response.json().then(data => {
          console.log('stops',data);
          this.setState({routeStops: data.data});
        });
      }).catch(error => {
        this.setState({routes: null});
      });
    }
  }

  showRoute(e) {
    e.preventDefault();
    for (var i = 0; i < this.state.routes.length; i++) {
      if(this.state.routes[i].shortName === this.state.searchTerm) {
        console.log('this.state.routes[i].shortName',this.state.routes[i].shortName);
        this.setState({routeId: this.state.routes[i].id}, this.getRouteStop);
      }
    }
  }

  addFavorite() {
      $.ajax({
          method: 'POST',
          url: 'favorites/' + this.state.searchTerm,
      }).done(function(data) {
          console.log('fav ajax posting');
          window.location = './';
      });
  }

  render() {
    let listStops = [];
    if (this.state.routeStops) {
      listStops = this.state.routeStops.references.stops.map((stop, index) => {
        return <li key={index}> {stop.name} </li>
      });
    }

    let lengthInfo = null;
    if (this.state.routeStops) {
      console.log("routeStops:", this.state.routeStops)
      lengthInfo = <p>route length: {this.state.routeStops.references.stops.length}</p>
    } else {
      lengthInfo = <p>route length: 0</p>
    }

    let tepmarkers=[];
    let polyLines = [];
    if (this.state.routeStops) {
      for (var i = 0; i < this.state.routeStops.references.stops.length; i++) {
        let latitude = this.state.routeStops.references.stops[i].lat;
        let longitude = this.state.routeStops.references.stops[i].lon;
        let stop= {
          position: {
            lat: latitude,
            lng: longitude
          },
          key: this.state.routeStops.references.stops[i].name + i,
          defaultAnimation: 2
        };
        tepmarkers.push(stop);
      }
      for (var j = 0; j < this.state.routeStops.entry.polylines.length; j++) {
        let points = Polyline.decode(this.state.routeStops.entry.polylines[j].points);
        polyLines.push(points);
      }
    }
   return (
    <div>
      <Navbar />
      <form className="submitForm" onSubmit={(e) => this.showRoute(e)}>
        <input placeholder="Enter the bus" className="inputField" type="text" required
               onChange={e => this.searchChange(e)}
               value={this.state.searchTerm} />
        <button type="submit">Submit</button>
      </form>
      <div>
        {lengthInfo}
          <ul>
            {listStops}
          </ul>
      </div>
      <p><button className="btn btn-primary" id="favButton" onClick={() => this.addFavorite(this.state.searchTerm)}>Add to Favorites</button></p>
      <ShowMap stops={tepmarkers} polyLines={polyLines} />
		</div>
   );
 }
}

export default Map;
