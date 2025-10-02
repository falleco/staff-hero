import type { GameMode } from "@/contexts/game-master-context";
import { useGameContext } from "./use-game-context";

export function useGameMaster() {
  const { settings, setGameSettings, setGameState, state } = useGameContext();

  const startGame = (mode: GameMode) => {
    setGameSettings({ ...settings, gameMode: mode });
    setGameState({
      ...state,
      isGameActive: true,
      startTime: Date.now(),
      currentScore: 0,
      currentStreak: 0,
      maxStreak: 0,
      totalQuestions: 0,
      totalCorrectAnswers: 0,
    });
  };

  const endGame = async () => {
    if (state.isGameActive && state.startTime > 0) {
      // const duration = Math.floor((Date.now() - state.startTime) / 1000);
      // const accuracy =
      //   state.totalQuestions > 0
      //     ? Math.round((state.correctAnswers / state.totalQuestions) * 100)
      //     : 0;
      // const session: GameSession = {
      //   id: `session_${Date.now()}`,
      //   date: new Date().toISOString(),
      //   gameMode: settings.gameMode,
      //   difficulty: settings.difficulty,
      //   notationSystem: settings.notation,
      //   score: state.score,
      //   streak: state.streak,
      //   maxStreak: state.maxStreak,
      //   totalQuestions: state.totalQuestions,
      //   correctAnswers: state.correctAnswers,
      //   accuracy,
      //   duration,
      // };
      // try {
      //   await addGameSession(session);
      // } catch (error) {
      //   console.error("Error saving game session:", error);
      // }
    }

    setGameState({
      ...state,
      isGameActive: false,
      currentQuestion: {
        id: "",
        notes: [],
        answers: [],
      },
    });
  };

  const submitAnswer = (answer: string[]) => {
    const isCorrect =
      JSON.stringify(answer.sort()) ===
      JSON.stringify(state.currentQuestion.answers.sort());
    const newStreak = isCorrect ? state.currentStreak + 1 : 0;
    const points = isCorrect ? 10 + state.currentStreak * 2 : 0;
    setGameState({
      ...state,
      currentQuestion: {
        ...state.currentQuestion,
        answers: answer.map((a) => ({ answer: a, isCorrect })),
      },
      currentScore: state.currentScore + points,
      currentStreak: newStreak,
      maxStreak: Math.max(state.maxStreak, newStreak),
      totalQuestions: state.totalQuestions + 1,
      totalCorrectAnswers: state.totalCorrectAnswers + (isCorrect ? 1 : 0),
    });
  };

  const nextQuestion = () => {
    setGameState({
      ...state,
      currentQuestion: {
        id: "",
        notes: [],
        answers: [],
      },
    });
  };

  const resetStreak = () => {
    setGameState({
      ...state,
      currentStreak: 0,
    });
  };

  const generateNewQuestion = () => {
    // const newQuestion = generateQuestion(settings);
    // setGameState({
    //   ...state,
    //   currentQuestion: newQuestion,
    // });
  };

  return {
    startGame,
    endGame,
    submitAnswer,
    nextQuestion,
    resetStreak,
    generateNewQuestion,
  };
}
