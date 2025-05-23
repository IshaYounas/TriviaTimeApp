import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonButton, IonItem, IonLabel, IonRadio, IonRadioGroup } from '@ionic/angular/standalone';

// imports
import { TriviaService } from '../services/trivia.service'; // trivia service
import { Router } from '@angular/router'; // router
import { HttpClient } from '@angular/common/http'; // http client
import { ScoreService } from '../services/score.service'; // score service
import { interval } from 'rxjs';
import { Preferences } from '@capacitor/preferences';


@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
  standalone: true,
  imports: [IonRadioGroup, IonRadio, IonLabel, IonItem, IonList, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton]
})

export class QuizPage implements OnInit {
  // variables
  questions: any[] = []; // array
  currentIndex: number = 0;
  score: number = 0;
  selectedAnswer : string = "";
  isQuizFinished: boolean = false;
  index: any;
  startTime: number = 0;
  elapsedTime: string = "";
  timer: number = 15;
  interval: any;

  // creating an instance of the trivia service 
  constructor(private triviaService: TriviaService, private httpClient:HttpClient, private router: Router, private scoreService: ScoreService) { }

  ngOnInit() {
    // using the trivia service
    this.triviaService.getAllQuestions().subscribe((data) => {
      const allQuestions = data.easyQuestions.concat(data.mediumHardQuestions); // combining the wuestions
      this.questions = this.triviaService.decodeQuestions(allQuestions);

      this.questions = this.triviaService.shuffleArray(this.questions);
     
      // joining the incorrect and correct answers
      // calling the shuffleArray method to shuffle the answers
      this.questions.forEach((q) => {
        const allAnswers = q.incorrect_answers.concat(q.correct_answer);
        q.shuffledAnswers = this.triviaService.shuffleArray(allAnswers);
        }); // forEach
        
      this.startTime = Date.now();
      this.startTimer();
    });
  }

  startTimer()
  {
    this.timer = 15;
    this.interval = setInterval(() => {
      if (this.timer > 0)
      {
        this.timer--; // decrement the timer
      } // if

      else
      {
          this.nextQuestion();
      } // else
    }, 1000);
  } // startTimer

  stopTimer()
  {
    if (this.interval)
    {
      clearInterval(this.interval);
    } // if
  } // stopTimer

  nextQuestion()
  {  
    if (this.selectedAnswer === this.questions[this.currentIndex].correct_answer)
    {
      this.score++;  // incrementing the score  
    } // if

    // quiz end
    if (this.currentIndex < this.questions.length - 1)
    {
      this.currentIndex++;
      this.selectedAnswer = "";
    } // if

    else
    {
      this.isQuizFinished = true;
    } // else

    this.stopTimer();
    this.startTimer();
  } // nextQuestion

  // finsih quiz
  async finishQuiz()
  {
    // calculating the time taken to complete the quiz
    const timeTaken = Date.now() - this.startTime;
    this.elapsedTime = (timeTaken / 1000).toFixed(2) + ' seconds';

    const result = await Preferences.get({ key: 'user' });
    const user = result.value ? JSON.parse(result.value) : null;

    // using the score service
    await this.scoreService.saveScore(this.score, this.elapsedTime, user.username, user.age); // saving the score
    this.router.navigate(['/result', { score: this.score}]);
  } // finishQuiz
}
