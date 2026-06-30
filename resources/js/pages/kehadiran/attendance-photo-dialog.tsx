import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Eye, ImageOff, MapPinned } from 'lucide-react';
import AttendanceMap from './attendance-map';

interface Office {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    radius_meter: number;
}

interface Props {
    title: string;
    image?: string | null;
    office: Office;
    latitude: number | null;
    longitude: number | null;
    distance: number | null;
}

export default function AttendancePhotoDialog({ title, image, office, latitude, longitude, distance }: Props) {
    const insideRadius = distance !== null && distance <= office.radius_meter;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                    Lihat Detail
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-5xl">
                <DialogHeader className='flex flex-col gap-0'>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Detail validasi kehadiran karyawan</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="photo">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="photo">Foto</TabsTrigger>

                        <TabsTrigger value="map">Lokasi</TabsTrigger>
                    </TabsList>

                    <TabsContent value="photo">
                        <div className="mt-4">
                            {image ? (
                                <img src={image} className="mx-auto max-h-[500px] rounded-xl border object-contain" />
                            ) : (
                                <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed">
                                    <ImageOff className="mb-2 h-10 w-10 text-muted-foreground" />

                                    <p className="text-muted-foreground">Foto tidak tersedia</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="map">
                        <div className="mt-4 space-y-5">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-md border p-2">
                                    <p className="text-xs text-muted-foreground">Kantor</p>

                                    <p className="font-medium text-xs">{office.name}</p>
                                </div>

                                <div className="rounded-md border p-2">
                                    <p className="text-xs text-muted-foreground">Jarak</p>

                                    <p className="font-semibold text-xs">{distance ?? '-'} meter</p>
                                </div>

                                <div className="rounded-md border p-2">
                                    <p className="text-xs text-muted-foreground">Latitude</p>

                                    <p className="text-xs">{latitude ?? '-'}</p>
                                </div>

                                <div className="rounded-md border p-2">
                                    <p className="text-xs text-muted-foreground">Longitude</p>

                                    <p className="text-xs">{longitude ?? '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPinned className="h-5 w-5 text-blue-600" />

                                    <span className="font-medium">Lokasi Absensi</span>
                                </div>

                                <Badge variant={insideRadius ? 'default' : 'destructive'}>
                                    {insideRadius ? 'Di Dalam Radius' : 'Di Luar Radius'}
                                </Badge>
                            </div>

                            <AttendanceMap office={office} latitude={latitude} longitude={longitude} />
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
