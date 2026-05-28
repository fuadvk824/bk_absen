import { useForm } from '@inertiajs/react'
import { route } from 'ziggy-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ChangePassword() {
  const { data, setData, post, processing, errors } = useForm({
    password: '',
    password_confirmation: '',
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    post(route('password.update'))
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">
        Ganti Password
      </h1>

      <Input
        type="password"
        placeholder="Password baru"
        value={data.password}
        onChange={e => setData('password', e.target.value)}
      />
      {errors.password && <p className="text-red-500">{errors.password}</p>}

      <Input
        type="password"
        placeholder="Konfirmasi password"
        value={data.password_confirmation}
        onChange={e => setData('password_confirmation', e.target.value)}
      />

      <Button disabled={processing}>
        Simpan Password
      </Button>
    </form>
  )
}
