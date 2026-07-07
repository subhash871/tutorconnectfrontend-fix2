import { useEffect, useRef } from 'react';

export default function VideoCall({ localStream, remoteStream, onEndCall, callState }) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);

  useEffect(() => {
    if (localRef.current && localStream) localRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (callState === 'idle') return null;

  return (
    <div className="video-call-overlay">
      <div className="video-call-remote">
        <video ref={remoteRef} autoPlay playsInline className="video-remote" />
        {callState !== 'connected' && <p className="text-sm text-muted">Connecting…</p>}
      </div>
      <video ref={localRef} autoPlay playsInline muted className="video-local" />
      <button className="btn btn-danger call-end-btn" onClick={onEndCall}>End Call</button>
    </div>
  );
}