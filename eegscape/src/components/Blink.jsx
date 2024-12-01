import React, { useState, useEffect } from 'react';
import { MuseClient, channelNames } from 'muse-js';
import { Observable, merge, of, timer } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { bandpass } from '../inputs/bandpass';

const MuseBlinker = () => {
  const [connected, setConnected] = useState(false);
  const [leftBlinks, setLeftBlinks] = useState([]);
  const [rightBlinks, setRightBlinks] = useState([]);

  const muse = new MuseClient();
  const bandpassFilter = bandpass(256, 0.1, 50);

  useEffect(() => {
    // Set up connection status subscription
    const connectionSubscription = muse.connectionStatus.subscribe(newStatus => {
      setConnected(newStatus);
    });

    return () => {
      // Clean up subscription when the component is unmounted
      connectionSubscription.unsubscribe();
    };
  }, []);

  const onConnectButtonClick = async () => {
    await muse.connect();
    muse.start();

    const leftEyeChannel = channelNames.indexOf('TP9');
    const rightEyeChannel = channelNames.indexOf('TP10');

    const leftBlinksObservable = muse.eegReadings.pipe(
      filter(r => r.electrode === leftEyeChannel),
      map(r => Math.max(...r.samples.map(n => Math.abs(n)))),
      map(value => bandpassFilter(value)),
    );

    const rightBlinksObservable = muse.eegReadings.pipe(
      filter(r => r.electrode === rightEyeChannel),
      map(r => Math.max(...r.samples.map(n => Math.abs(n)))),
      map(value => bandpassFilter(value)),
      
    );

    // Subscribe to blink observables
    leftBlinksObservable.subscribe(value => {
      setLeftBlinks(prev => [...prev, value]);
    });

    rightBlinksObservable.subscribe(value => {
      setRightBlinks(prev => [...prev, value]);
    });
  };

  const onDisconnectButtonClick = () => {
    muse.disconnect();
  };

  return (
    <div>
      <h1>Muse Blinks</h1>
      <div>
        <button onClick={onConnectButtonClick} disabled={connected}>
          Connect
        </button>
        <button onClick={onDisconnectButtonClick} disabled={!connected}>
          Disconnect
        </button>
      </div>
      <div>
        <h2>Left Eye Blinks:</h2>
        <p>{leftBlinks.join(', ')}</p>
      </div>
      <div>
        <h2>Right Eye Blinks:</h2>
        <p>{rightBlinks.join(', ')}</p>
      </div>
    </div>
  );
};

export default MuseBlinker;