import { useEffect, useState } from 'react';
import { LinearProgress } from '@mui/material';

export default function FakeProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress === 80) {
          return oldProgress;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <LinearProgress
      sx={{ margin: '0 auto' }}
      variant="determinate"
      value={progress}
    />
  );
}
