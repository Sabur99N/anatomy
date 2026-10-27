
import React, { useState } from 'react';
import { OrganData } from '../types';
import { X, CheckCircle2, XCircle, Award, Trophy, RotateCcw } from 'lucide-react';

interface QuizProps {
  organ: OrganData;
  onClose: () => void;
}

const Quiz: React.FC<QuizProps> = ({ organ, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const quiz = organ.quiz;
  const currentQ = quiz[currentIdx];

  const handleOptionSelect = (idx: number) => {
    if (isLocked) return;
    setSelectedOption(idx);
    setIsLocked(true);
    
    if (idx === currentQ.answer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentIdx < quiz.length - 1) {
        setCurrentIdx(currentIdx + 1);
        setSelectedOption(null);
        setIsLocked(false);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const reset = () => {
    setCurrentIdx(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsLocked(false);
  };

  if (showResult) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className="p-10 flex flex-col items-center text-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/40">
          <Trophy size={48} className="text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold">Quiz Complete!</h2>
          <p className="text-white/60">Anatomical Proficiency: {organ.name}</p>
        </div>
        
        <div className="w-full flex items-center justify-center gap-10 my-4">
          <div className="flex flex-col">
            <span className="text-4xl font-bold">{percentage}%</span>
            <span className="text-xs uppercase tracking-widest text-white/40">Score</span>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="flex flex-col">
            <span className="text-4xl font-bold">{score}/{quiz.length}</span>
            <span className="text-xs uppercase tracking-widest text-white/40">Correct</span>
          </div>
        </div>

        <p className="text-sm text-white/80 max-w-xs leading-relaxed">
          {percentage === 100 ? "Incredible! You have mastered this organ's anatomy." : "Great effort! Review the study materials to achieve a perfect score."}
        </p>

        <div className="flex items-center gap-3 w-full mt-4">
          <button onClick={reset} className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all">
            <RotateCcw size={18} /> Retry
          </button>
          <button onClick={onClose} className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 rounded-2xl font-bold transition-all">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-400">
          <Award size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Medical Examination</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/40">Question {currentIdx + 1} of {quiz.length}</span>
          <div className="flex gap-1">
            {quiz.map((_, i) => (
              <div key={i} className={`w-8 h-1.5 rounded-full ${i <= currentIdx ? 'bg-purple-500' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
        <h3 className="text-2xl font-display font-bold leading-tight">{currentQ.question}</h3>
      </div>

      <div className="space-y-3">
        {currentQ.options.map((opt, i) => {
          const isCorrect = i === currentQ.answer;
          const isSelected = selectedOption === i;
          let variant = "bg-white/5 border-white/10 hover:border-white/30";
          
          if (isLocked) {
            if (isCorrect) variant = "bg-green-500/20 border-green-500/50 text-green-400";
            else if (isSelected) variant = "bg-red-500/20 border-red-500/50 text-red-400";
            else variant = "bg-white/5 border-white/10 opacity-40";
          }

          return (
            <button
              key={i}
              onClick={() => handleOptionSelect(i)}
              disabled={isLocked}
              className={`w-full p-5 text-left rounded-2xl border transition-all flex items-center justify-between group ${variant}`}
            >
              <span className="font-medium">{opt}</span>
              {isLocked && isCorrect && <CheckCircle2 size={18} />}
              {isLocked && isSelected && !isCorrect && <XCircle size={18} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Quiz;
