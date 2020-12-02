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
    const movimientoMarcador = useRef( new Subject() );
    const nuevoMarcador = useRef( new Subject() );
    
    
    //Mapa y coords
    const mapa = useRef();
    const [ coords, setCoords ] = useState( puntoInicial );
    
    // funcion para agregar marcadores
    
    const agregarMarcador = useCallback( (ev, id) => {
        
        console.log('useCallBack', ev);
        const { lng, lat } =  ev.lngLat || ev;
        const marker = new mapboxgl.Marker();
        marker.id = id ?? v4(); 
        
        marker
            .setLngLat( [ lng, lat])
            .addTo( mapa.current)
            .setDraggable( true );
        
        marcadores.current[ marker.id ] = marker;
        
        if( !id ){
            nuevoMarcador.current.next({
                id: marker.id,
                lng,
                lat
            });    
        }
                
        //Escuchar movimientos del macador
        marker.on('drag', ({target}) => {
            console.log('Drag');
            const { id } = target;
            const { lng, lat } =  target.getLngLat();
            
            //TODO: Emitir los cambios del marcador
            movimientoMarcador.current.next({
                id,
                lng,
                lat
            });
           
        });
    }, []);
    
    //Funcion para actualizar la ubicacion del marcador
    
    const actualizarPosicion = useCallback( ( { id, lng, lat} ) => {
        marcadores.current[id].setLngLat([ lng, lat ]);
    }, []);
    
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
        actualizarPosicion,
        coords,
        marcadores,
        movimientoMarcador$: movimientoMarcador.current,
        nuevoMarcador$: nuevoMarcador.current,
        setRef
    }
}
