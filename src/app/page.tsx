'use client'
import { Loader } from '@googlemaps/js-api-loader'
import { useEffect } from 'react'
import { useRef, useState } from 'react'

export default function Home() {
    const [routeBoundPolygon, setRouteBoundPolygon] = useState<any[]>([])
    const startRef = useRef<any>(null)
    const endRef = useRef<any>(null)
    const searchRadius = useRef<any>(null)

    const handleCreateRoute = async () => {
        const routeFetch = await fetch(
            'https://routes.googleapis.com/directions/v2:computeRoutes?key=AIzaSyALAZ67iArL3o1bs698kS7EvgEX5Sdrcvc',
            {
                method: 'POST',
                body: JSON.stringify({
                    origin: { address: startRef.current!.value },
                    destination: { address: endRef.current!.value },
                }),
                headers: {
                    'X-Goog-FieldMask': '*',
                },
            }
        )
        const routeData = await routeFetch.json()
        const polyline = routeData.routes[0].legs[0].polyline.encodedPolyline
        const polygonFetch = await fetch('/api/get-polygon', {
            method: 'POST',
            body: JSON.stringify({
                radius: parseFloat(searchRadius.current.value) / 111,
                resolution: (3 * parseFloat(searchRadius.current.value)) / 111,
                polyline,
            }),
        })
        const polygonData = await polygonFetch.json()
        setRouteBoundPolygon(
            polygonData.map((coords: any[]) => ({ lng: coords[1], lat: coords[0] }))
        )
    }
    useEffect(() => {
        const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GAPI_KEY!,
            version: 'weekly',
        })
        const mapOptions = {
            center: {
                lat: routeBoundPolygon[0]?.lat ?? 0,
                lng: routeBoundPolygon[0]?.lng ?? 0,
            },
            zoom: routeBoundPolygon[0] ? 10 : 4,
            mapId: 'demo',
        }

        const loadMap = async () => {
            const { Map } = await loader.importLibrary('maps')
            const map = new Map(document.getElementById('map')!, mapOptions)
            console.debug(routeBoundPolygon)
            const routePoly = new google.maps.Polygon({
                paths: routeBoundPolygon,
                strokeColor: '#000000',
                strokeOpacity: 0.2,
                strokeWeight: 2,
                fillColor: '#000000',
                fillOpacity: 0.2,
            })

            routePoly.setMap(map)
        }
        loadMap()
    }, [routeBoundPolygon])

    return (
        <main>
            <div className='flex'>
                <div id='map' className='basis-3/4 h-screen' />
                <div className='p-4 bg-slate-100 basis-1/4'>
                    <div className='flex gap-2 flex-col'>
                        <input className='input' placeholder='Start' ref={startRef} />
                        <input className='input' placeholder='Destination' ref={endRef} />
                        <input
                            className='input'
                            placeholder='Search Radius (mi)'
                            ref={searchRadius}
                        />
                        <button className='btn' onClick={handleCreateRoute}>
                            Go
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}
