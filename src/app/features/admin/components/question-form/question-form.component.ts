import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideCheck, LucideCheckCircle2, LucideChevronRight, LucideInfo, LucideListChecks, LucidePlusCircle, LucideTrash2, LucideX } from '@lucide/angular';
import { Quiz } from '../../../home/models/quiz.model';
import { QuizService } from '../../../home/services/quiz.service';

export type QuestionType = 'single' | 'multiple' | 'boolean';
export interface QuestionAnswer { id: number; text: string; feedback: string; correct: boolean; }
export interface QuestionFormValue { type: QuestionType; prompt: string; rationale: string; hint: string; shuffle: boolean; booleanAnswer: boolean; options: QuestionAnswer[]; quizId?: number | null; level?: number; image?: string; }

@Component({selector:'app-question-form',imports:[FormsModule,RouterLink,LucideCheck,LucideCheckCircle2,LucideChevronRight,LucideInfo,LucideListChecks,LucidePlusCircle,LucideTrash2,LucideX],templateUrl:'./question-form.component.html',styleUrls:['./question-form.component.css','./question-form-assignment.component.css']})
export class QuestionFormComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  readonly mode=input<'create'|'edit'>('create'); readonly questionId=input('New'); readonly initialValue=input<QuestionFormValue|null>(null);
  readonly cancelForm=output<void>(); readonly submitForm=output<{mode:'draft'|'finish'|'another';value:QuestionFormValue}>();
  protected readonly questionType=signal<QuestionType>('single'); protected readonly prompt=signal(''); protected readonly rationale=signal(''); protected readonly hint=signal(''); protected readonly shuffle=signal(true); protected readonly booleanAnswer=signal(true); protected readonly options=signal<QuestionAnswer[]>(this.defaultOptions());
  protected readonly quizId=signal<number|null>(null); protected readonly level=signal(1); protected readonly image=signal(''); protected readonly quizzes=signal<Quiz[]>([]); protected readonly quizzesLoading=signal(true);
  protected readonly message=signal(''); protected readonly messageKind=signal<'success'|'error'>('success'); protected readonly wordCount=computed(()=>this.prompt().trim()?this.prompt().trim().split(/\s+/).length:0); protected readonly pageTitle=computed(()=>this.mode()==='edit'?'Edit Question':'Create Question');
  private loadedValue:QuestionFormValue|null=null;
  constructor(){effect(()=>this.ensureInitialValue());}
  ngOnInit():void{this.quizService.getAllQuizzes(1,1000).subscribe({next:response=>{this.quizzes.set(response.items);this.quizzesLoading.set(false);},error:()=>{this.quizzesLoading.set(false);this.messageKind.set('error');this.message.set('Unable to load quizzes for question assignment.');}});}
  protected ensureInitialValue():void{const value=this.initialValue();if(!value||value===this.loadedValue)return;this.loadedValue=value;this.questionType.set(value.type);this.prompt.set(value.prompt);this.rationale.set(value.rationale);this.hint.set(value.hint);this.shuffle.set(value.shuffle);this.booleanAnswer.set(value.booleanAnswer);this.options.set(value.options.map(option=>({...option})));this.quizId.set(value.quizId??null);this.level.set(value.level??1);this.image.set(value.image??'');}
  protected selectType(type:QuestionType):void{this.questionType.set(type);this.message.set('');}
  protected updateOption(id:number,field:'text'|'feedback',value:string):void{this.options.update(items=>items.map(item=>item.id===id?{...item,[field]:value}:item));}
  protected toggleCorrect(id:number):void{this.options.update(items=>items.map(item=>({...item,correct:this.questionType()==='single'?item.id===id:item.id===id?!item.correct:item.correct})));}
  protected addOption():void{this.options.update(items=>[...items,{id:Math.max(0,...items.map(item=>item.id))+1,text:'',feedback:'',correct:false}]);}
  protected removeOption(id:number):void{if(this.options().length>2)this.options.update(items=>items.filter(item=>item.id!==id));}
  protected optionLabel(index:number):string{return String.fromCharCode(65+index);} protected cancel():void{this.cancelForm.emit();}
  protected save(mode:'draft'|'finish'|'another'):void{if(!this.isValid()){this.messageKind.set('error');this.message.set('Enter the prompt, complete every answer, and select the required correct answer.');return;}this.message.set('');this.submitForm.emit({mode,value:this.value()});}
  private value():QuestionFormValue{return{type:this.questionType(),prompt:this.prompt(),rationale:this.rationale(),hint:this.hint(),shuffle:this.shuffle(),booleanAnswer:this.booleanAnswer(),options:this.options(),quizId:this.quizId(),level:this.level(),image:this.image()};}
  private isValid():boolean{const correct=this.options().filter(option=>option.correct).length;return !!this.prompt().trim()&&(this.questionType()==='boolean'||(this.options().every(option=>option.text.trim())&&(this.questionType()==='single'?correct===1:correct>=1)));}
  private resetForm():void{this.questionType.set('single');this.prompt.set('');this.rationale.set('');this.hint.set('');this.booleanAnswer.set(true);this.options.set(this.defaultOptions());}
  private defaultOptions():QuestionAnswer[]{return[1,2,3,4].map((id,index)=>({id,text:'',feedback:'',correct:index===0}));}
}
