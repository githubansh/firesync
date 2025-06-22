import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
}

export const VoiceRecorder = ({ 
  onRecordingComplete, 
  onCancel, 
  maxDuration = 60 
}: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      // Request microphone access with better error handling
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Use appropriate MIME type for better compatibility
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          setRecordedBlob(blob);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
          
          // Stop all tracks to release microphone
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        } catch (error) {
          console.error('Error processing recorded audio:', error);
          toast({
            title: "Recording Error",
            description: "Failed to process recorded audio",
            variant: "destructive",
          });
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: "Recording Error",
          description: "Failed to record audio",
          variant: "destructive",
        });
        stopRecording();
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      let errorMessage = "Could not access microphone. Please check permissions.";
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Microphone access denied. Please allow microphone access and try again.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No microphone found. Please connect a microphone and try again.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Audio recording is not supported in this browser.";
        }
      }
      
      toast({
        title: "Microphone Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Clean up stream if recording was stopped manually
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.play();
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setRecordedBlob(null);
    setAudioUrl('');
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const sendRecording = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob, recordingTime);
      deleteRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#222299]/50 backdrop-blur-sm border border-[#00e6e6]/30 rounded-lg p-4 space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-white mb-2">Voice Message</h4>
        <div className="text-2xl font-mono text-[#00e6e6]">
          {formatTime(recordingTime)}
        </div>
        <Progress 
          value={(recordingTime / maxDuration) * 100} 
          className="mt-2"
        />
      </div>

      {/* Recording Controls */}
      {!recordedBlob && (
        <div className="flex justify-center gap-3">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16"
            >
              <Mic className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-full w-16 h-16"
            >
              <Square className="w-6 h-6" />
            </Button>
          )}
        </div>
      )}

      {/* Playback Controls */}
      {recordedBlob && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={isPlaying ? pausePlayback : playRecording}
            className="border-[#00e6e6]/30 text-[#00e6e6] hover:bg-[#00e6e6]/10 bg-[#111184]/40"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            onClick={deleteRecording}
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-[#111184]/40"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={sendRecording}
            className="bg-gradient-to-r from-[#00e6e6] to-[#00cccc] hover:from-[#00cccc] hover:to-[#009999] text-[#111184] font-medium"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Cancel Button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-gray-300 hover:text-white hover:bg-[#00e6e6]/10"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
