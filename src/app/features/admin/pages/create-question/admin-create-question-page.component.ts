import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionFormComponent, QuestionFormValue } from '../../components/question-form/question-form.component';
import { CreateQuestionRequest, QuestionService } from '../../services/question.service';

@Component({selector:'app-admin-create-question-page',imports:[QuestionFormComponent],template:'@if(errorMessage()){<div class="api-error" role="alert">{{errorMessage()}}</div>}<app-question-form (cancelForm)="goBack()" (submitForm)="handleSubmit($event)" />',styles:['.api-error{margin:16px 28px 0;padding:12px 16px;border-radius:10px;background:#fee2e2;color:#b91c1c;font-weight:700}']})
export class AdminCreateQuestionPageComponent {
  private readonly router=inject(Router);
  private readonly questionService=inject(QuestionService);
  protected readonly errorMessage=signal('');
  private submitting=false;
  protected goBack():void{void this.router.navigate(['/admin/questions']);}
  protected handleSubmit(event:{mode:'draft'|'finish'|'another';value:QuestionFormValue}):void{
    if(this.submitting)return;
    this.submitting=true;this.errorMessage.set('');
    const request:CreateQuestionRequest={
      content:event.value.prompt.trim(),image:event.value.image?.trim()??'',level:event.value.level??1,
      questionType:event.value.type==='single'?0:event.value.type==='multiple'?1:2,quizId:event.value.quizId??null,
      answers:event.value.type==='boolean'
        ?[{text:'True',isCorrect:event.value.booleanAnswer},{text:'False',isCorrect:!event.value.booleanAnswer}]
        :event.value.options.map(option=>({text:option.text.trim(),isCorrect:option.correct}))
    };
    this.questionService.createQuestion(request).subscribe({
      next:()=>{this.submitting=false;this.goBack();},
      error:(error:HttpErrorResponse)=>{this.submitting=false;this.errorMessage.set(error.error?.detail??error.error?.title??'Unable to create the question. Please try again.');}
    });
  }
}
