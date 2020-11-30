import { useRef, useState, useEffect, useCallback } from 'react';
import mapboxgl   from 'mapbox-gl';
import { v4 } from 'uuid'
import { Subject } from 'rxjs';

mapboxgl.accessToken = 'pk.eyJ1Ijoib3JsaW5hbHZhcmFkbyIsImEiOiJja2h6cGpjYXgwcTBoMnhyMDU2OTkzdWd6In0.C-JpIKQdCvBOqnfeXcO3Ew';

export const useMapbox = ( puntoInicial ) => {
    
    //Referencia al DIV del  mapa
    const mapaDiv = useRef();
    
    const setRef = useCallback( (node) => {
        mapaDiv.current = node;
    }, []);
    
    const marcadores = useRef({});
    
    //Observables del Rxjs
    const movimientoMarcador = useRef( new Subject() );;
    const nuevoMarcador = useRef( new Subject() );
    
    
    //Mapa y coords
    const mapa = useRef();
    const [ coords, setCoords ] = useState( puntoInicial );
    
    // funcion para agregar marcadores
    
    const agregarMarcador = useCallback( (ev) => {
        const { lng, lat } =  ev.lngLat;
        const marker = new mapboxgl.Marker();
        marker.id = v4(); //TODO: si el marcador ya tiene ID
        
        marker
            .setLngLat( [ lng, lat])
            .addTo( mapa.current)
            .setDraggable( true );
        
        marcadores.current[ marker.id ] = marker;
        
        //TODO: si el marcador tiene ID no emitir;
        nuevoMarcador.current.next({
            id: marker.id,
            lng,
            lat
        });
        
        //Escuchar movimientos del macador
        marker.on('drag', ({target}) => {
            const { id } = target;
            const { lng, lat } =  target.getLngLat();
            
            //TODO: Emitir los cambios del marcador
            movimientoMarcador.current.next({
                id,
                lng,
                lat
            });
           
        });
    });
   
    useEffect(() => {
        var map = new mapboxgl.Map({
            container: mapaDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [puntoInicial.lng, puntoInicial.lat],
            zoom: puntoInicial.zoom
            });
            
            mapa.current = map;
        
    }, [ puntoInicial ]);
    
    useEffect(() => {
        mapa.current?.on('move', () => {
            const { lng, lat } = mapa.current.getCenter();
            
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            })
        });
        
        return mapa.current?.off('move');
    }, []);
    
    //Agregar marcadores cuando hago click
    useEffect(() => {
        
        //Forma larga
        // mapa.current?.on('click', (ev) => {
        //     agregarMarcador(ev);
        // });
        
        //Forma corta
        mapa.current?.on('click', agregarMarcador );
        
    }, [agregarMarcador]);
    
    return {
        agregarMarcador,
        coords,
        marcadores,
        movimientoMarcador$: movimientoMarcador.current,
        nuevoMarcador$: nuevoMarcador.current,
        setRef
    }
}
