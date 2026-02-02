'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, RotateCcw, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useQuiz } from '@/lib/hooks';
import type { QuizQuestion } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  documentId: string;
}

export default function QuizPanel({ documentId }: Props) {
  const { quiz, loading } = useQuiz(documentId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  function startQuiz() {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswered(false);
    setQuizStarted(true);
    setQuizComplete(false);
  }

  function handleAnswer(index: number) {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    if (quiz && index === quiz.questions[currentIndex].correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function nextQuestion() {
    if (!quiz) return;
    if (currentIndex + 1 >= quiz.questions.length) {
      setQuizComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">Loading quiz...</div>
    );
  }

  // No quiz exists for this document
  if (!quiz) {
    return (
      <div className="p-6 text-center">
        <BrainCircuit size={32} className="mx-auto mb-3 text-slate-300" />
        <h3 className="text-base font-semibold mb-1">No Quiz Yet</h3>
        <p className="text-sm text-slate-500">
          Quiz will be available once generated during content prep
        </p>
      </div>
    );
  }

  // Quiz exists but not started
  if (!quizStarted) {
    return (
      <div className="p-6 text-center">
        <BrainCircuit size={32} className="mx-auto mb-3 text-indigo-500" />
        <h3 className="text-base font-semibold mb-1">Quiz Ready</h3>
        <p className="text-sm text-slate-500 mb-4">
          {quiz.questions.length} questions
        </p>
        <Button onClick={startQuiz} className="cursor-pointer">
          Start Quiz
        </Button>
      </div>
    );
  }

  // Quiz complete: show results
  if (quizComplete) {
    const pct = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Quiz Complete!</h3>
          <p className="text-3xl font-bold mb-1">
            {score}/{quiz.questions.length}
          </p>
          <Badge className={cn(
            pct >= 80 ? 'bg-green-100 text-green-800' :
            pct >= 50 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          )}>
            {pct}% — {pct >= 80 ? 'Excellent!' : pct >= 50 ? 'Good effort' : 'Keep reviewing'}
          </Badge>
        </div>

        {/* Show all questions with correct answers and explanations */}
        {quiz.questions.map((q: QuizQuestion, i: number) => (
          <div key={i} className="mb-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm font-medium mb-1">
              {i + 1}. {q.question}
            </p>
            <p className="text-xs text-green-700">
              {q.options[q.correctIndex]}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {q.explanation}
            </p>
          </div>
        ))}

        <div className="flex gap-3 justify-center mt-4">
          <Button onClick={startQuiz} variant="outline" className="cursor-pointer">
            <RotateCcw size={14} className="mr-1.5" />
            Retake
          </Button>
          <Button onClick={() => { setQuizStarted(false); setQuizComplete(false); }} variant="ghost" className="cursor-pointer">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Active quiz: show current question
  const q = quiz.questions[currentIndex];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          <BrainCircuit size={14} className="text-indigo-500" />
          Question {currentIndex + 1} of {quiz.questions.length}
        </span>
        <span className="text-xs text-slate-500">
          Score: {score}/{currentIndex + (answered ? 1 : 0)}
        </span>
      </div>
      <Progress
        value={((currentIndex + (answered ? 1 : 0)) / quiz.questions.length) * 100}
        className="h-1.5 mb-4"
      />

      <p className="text-sm font-medium mb-3">{q.question}</p>

      <div className="space-y-2">
        {q.options.map((option: string, i: number) => {
          const isCorrect = i === q.correctIndex;
          const isSelected = i === selectedAnswer;
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={cn(
                'w-full p-3 rounded-lg border-2 text-left text-sm transition-all',
                !answered && 'hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer',
                answered && isCorrect && 'bg-green-50 border-green-400 text-green-800',
                answered && isSelected && !isCorrect && 'bg-red-50 border-red-400 text-red-800',
                answered && !isCorrect && !isSelected && 'opacity-50',
                !answered && 'bg-white border-slate-200',
              )}
            >
              <span className="flex items-center gap-2">
                {answered && isCorrect && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
                {answered && isSelected && !isCorrect && <XCircle size={14} className="text-red-500 shrink-0" />}
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {answered && (
        <>
          <p className="text-xs text-slate-600 mt-3 p-2 bg-slate-50 rounded">
            {q.explanation}
          </p>
          <div className="mt-3 flex justify-end">
            <Button onClick={nextQuestion} size="sm" className="cursor-pointer">
              {currentIndex + 1 >= quiz.questions.length ? 'See Results' : 'Next'}
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
