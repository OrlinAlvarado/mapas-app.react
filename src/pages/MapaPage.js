import React, { useContext, useEffect } from 'react'
import { SocketContext } from '../context/SocketContext';

import { useMapbox } from '../hooks/useMapbox';

const puntoInicial = {
    lng: -88.0309,
    lat: 15.5202,
    zoom: 9.76
}


export const MapaPage = () => {
    
   const { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } =  useMapbox( puntoInicial );
   const { socket } = useContext( SocketContext );
    
   useEffect(() => {
       socket.on( 'marcadores-activos', (marcadores) => {
            for( const key of Object.keys( marcadores )){
                agregarMarcador(marcadores[key], key);
            }
       });
       
   }, [ socket, agregarMarcador ]);
   
   useEffect(() => {
       nuevoMarcador$.subscribe( marcador => {
           socket.emit('marcador-nuevo', marcador);
           console.log('Evento marcador', marcador);
       });
       
   }, [nuevoMarcador$, socket])
   
   useEffect(() => {
    movimientoMarcador$.subscribe( marcador => {
        socket.emit('marcador-actualizado', marcador);
    });
    
    }, [socket, movimientoMarcador$])
    
    
    //Crear un marcador desde el socket
    useEffect( () => {
        socket.on('marcador-nuevo', (marcador) => {
            console.log('Recibiendo marcador del servidor', marcador);
           agregarMarcador(marcador, marcador.id);
        });
        
    }, [ socket, agregarMarcador])
    
    useEffect( () => {
        socket.on('marcador-actualizado', ( marcador ) => {
            actualizarPosicion( marcador );
        })
    }, [ socket, actualizarPosicion ]);
 
    
    return (
        <>
            <div className="info">
                Lng: { coords.lng } | lat: { coords.lat } | zoom: { coords.zoom } 
            </div>
            <div 
                ref={ setRef }
                className="mapContainer"
            
            />
        </>
    )
}
