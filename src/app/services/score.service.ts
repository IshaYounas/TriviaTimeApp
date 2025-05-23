import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  constructor() { }

  async saveScore(score: number, timeTaken: string = "", username: string, age: number)
  {
    const position = await Geolocation.getCurrentPosition(); // getting the location
    const result = await Preferences.get({ key: 'scores' }); // getting the already existing scores

    let oldScores = [];
    if (result.value) // scores found
    {
      oldScores = JSON.parse(result.value); // parse value from json to array
    }

    // newScore array
    const newScore = {score: score,
      dateTime: new Date().toLocaleString(), // date  and time of when the quiz completed
      timeTaken : timeTaken,
      username: username,
      age:  age,
      location:
      {
        lat: position.coords.latitude,
        lon: position.coords.longitude
      }    
    };

    // pushing the newScores on to the old scores
  	oldScores.push(newScore);    

    // saving updated scores
    await Preferences.set
    ({
      key: 'scores',
      value: JSON.stringify(oldScores) // converting array to string
    })
  } // saveScore

  // loading saved scores from local storage
    async getScores(): Promise<any[]>
    {
        const result = await Preferences.get({key: 'scores'});
        
        if (result.value) // value found
        {
          return JSON.parse(result.value); // parsing to js array
        } // if

        else // value no found
        {
          return [];
        } // else
    } // getScores

    async clearAllScores()
    {
      await Preferences.remove({key: 'scores' }); 
    } // clearAllScores
}
