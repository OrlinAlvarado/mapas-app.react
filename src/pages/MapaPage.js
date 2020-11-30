import React, { useEffect } from 'react'

import { useMapbox } from '../hooks/useMapbox';

const puntoInicial = {
    lng: -88.0309,
    lat: 15.5202,
    zoom: 9.76
}


export const MapaPage = () => {
    
   const { coords, setRef, nuevoMarcador$, movimientoMarcador$ } =  useMapbox( puntoInicial );
   
   useEffect(() => {
       nuevoMarcador$.subscribe( marcador => {
           //TODO: Nuevo marcador Emitir
       });
       
   }, [nuevoMarcador$])
   
   useEffect(() => {
    movimientoMarcador$.subscribe( marcador => {
        //TODO: Movimiento marcador emitir
        
        console.log(marcador);
    });
    
}, [movimientoMarcador$])
    
    
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
