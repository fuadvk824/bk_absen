import { useState } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil } from 'lucide-react';

interface Props {
    id: number;
    checkIn?: string | null;
    checkOut?: string | null;
    name?: string;
}

export default function EditAttendanceDialog({ id, checkIn, checkOut, name }: Props) {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
        check_in: checkIn?.substring(0, 5) ?? '',
        check_out: checkOut?.substring(0, 5) ?? '',
    });

    const submit = () => {
        router.put(
            route('attendance.update', {
                attendance: id,
            }),
            form,
            {
                preserveScroll: true,
                onSuccess: () => setOpen(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Pencil/> Edit</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Attendance - {name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label>Check In</label>

                        <Input
                            type="time"
                            value={form.check_in}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    check_in: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <label>Check Out</label>

                        <Input
                            type="time"
                            value={form.check_out}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    check_out: e.target.value,
                                })
                            }
                        />
                    </div>

                    <Button className="w-full" onClick={submit}>
                        Simpan
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
