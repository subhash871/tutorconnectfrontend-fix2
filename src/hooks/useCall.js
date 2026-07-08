import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL, tokenStore } from '../api/client';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  // Free public TURN server (Open Relay Project) — needed as a fallback
  // because STUN alone frequently fails to connect two peers that are
  // behind different NATs/firewalls (a very common real-world case).
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
];

export function useCall(conversationId) {
  const [callState, setCallState] = useState('idle'); // idle | calling | ringing | connected
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null); // { offer } | null

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const pendingOfferRef = useRef(null);

  const connectSocket = useCallback(() => {
    if (wsRef.current) return wsRef.current;
    const token = tokenStore.getAccess();
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsBase}/ws/chat/${conversationId}/?token=${token}`);

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'call_offer') handleIncomingOffer(data.payload);
      else if (data.type === 'call_answer') await handleAnswer(data.payload);
      else if (data.type === 'ice_candidate') await handleIce(data.payload);
      else if (data.type === 'call_end') resetCallState();
    };
    wsRef.current = ws;
    return ws;
  }, [conversationId]);

  const send = (type, payload) => {
    wsRef.current?.send(JSON.stringify({ type, payload }));
  };

  // Always listen for incoming call signals while this conversation is
  // open, not only when the user themselves initiates a call — otherwise
  // the receiving side never hears the incoming call_offer at all.
  useEffect(() => {
    if (!conversationId) return undefined;
    connectSocket();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [conversationId, connectSocket]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pc.onicecandidate = (e) => {
      if (e.candidate) send('ice_candidate', e.candidate);
    };
    pc.ontrack = (e) => setRemoteStream(e.streams[0]);
    pcRef.current = pc;
    return pc;
  };

  const startCall = async (video = true) => {
    const ws = connectSocket();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    setLocalStream(stream);
    const pc = createPeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sendOffer = () => send('call_offer', offer);
    if (ws.readyState === WebSocket.OPEN) sendOffer();
    else ws.onopen = sendOffer;

    setCallState('calling');
  };

  const handleIncomingOffer = (offer) => {
    // Don't interrupt a call already in progress
    if (callState !== 'idle') return;
    pendingOfferRef.current = offer;
    setIncomingCall({ offer });
    setCallState('ringing');
  };

  const acceptCall = async (video = true) => {
    const offer = pendingOfferRef.current;
    if (!offer) return;
    setIncomingCall(null);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
    setLocalStream(stream);
    const pc = createPeerConnection();
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    send('call_answer', answer);
    setCallState('connected');
    pendingOfferRef.current = null;
  };

  const declineCall = () => {
    send('call_end', {});
    pendingOfferRef.current = null;
    setIncomingCall(null);
    setCallState('idle');
  };

  const handleAnswer = async (answer) => {
    await pcRef.current?.setRemoteDescription(answer);
    setCallState('connected');
  };

  const handleIce = async (candidate) => {
    try {
      await pcRef.current?.addIceCandidate(candidate);
    } catch (err) {
      console.error('ICE add error', err);
    }
  };

  const resetCallState = () => {
    pcRef.current?.close();
    pcRef.current = null;
    pendingOfferRef.current = null;
    setLocalStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return null;
    });
    setRemoteStream(null);
    setIncomingCall(null);
    setCallState('idle');
  };

  const endCall = () => {
    send('call_end', {});
    resetCallState();
  };

  return {
    callState,
    localStream,
    remoteStream,
    incomingCall,
    startCall,
    acceptCall,
    declineCall,
    endCall,
  };
}