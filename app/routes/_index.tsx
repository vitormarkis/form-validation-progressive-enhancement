import { zodResolver } from "@hookform/resolvers/zod"
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node"
import { Form, useActionData, useSubmit } from "@remix-run/react"
import { FormEvent } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { mapZodErrorsToRHFErrors } from "~/utils/map"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ]
}

const formSchema = z.object({
  email: z.string().email("Formato de email inválido."),
  password: z
    .string()
    .min(4, "Muito curto.")
    .includes(" ", { message: "Inclua pelo menos 1 espaço." }),
})

type FormSchema = z.infer<typeof formSchema>

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  const validation = formSchema.safeParse(data)
  if (!validation.success) {
    const parsedErrors = mapZodErrorsToRHFErrors(validation.error.issues)
    return {
      errors: parsedErrors,
      data: undefined,
    }
  }
  return {
    errors: null,
    data: {
      payload: validation.data,
      message: "Payload sent successfully!",
    },
  }
}

export default function Index() {
  const { register, formState, handleSubmit } = useForm<FormSchema>({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
    resolver: zodResolver(formSchema),
  })
  const submit = useSubmit()

  const submitHandler =
    (e: FormEvent<HTMLFormElement>): SubmitHandler<FormSchema> =>
    data => {
      // data é o formData em formato de objeto
      // (typesafety) tratada pelo RHF no client,
      // serve apenas para side effects no callback

      // esse submit não precisa do RHF
      // mas como demos wrap do `handleSubmit`
      // o resolver do RHF não permite essa
      // função rodar se tiver inputs invalidos
      submit(e.currentTarget)
    }

  const actionData = useActionData<typeof action>()
  const errors = actionData?.errors ?? formState.errors

  return (
    <Form
      onSubmit={e => handleSubmit(submitHandler(e))}
      method="post"
    >
      {!actionData?.errors && (
        <h2 style={{ color: "green" }}>{actionData?.data.message}</h2>
      )}
      <label htmlFor="email">
        <span>E-mail</span>
        <input
          autoFocus
          type="text"
          id="email"
          {...register("email")}
        />
      </label>
      <br />
      <strong style={{ color: "red" }}>{errors.email?.message}</strong>
      <br />
      <label htmlFor="password">
        <span>Password</span>
        <input
          type="password"
          id="password"
          {...register("password")}
        />
      </label>
      <br />
      <strong style={{ color: "red" }}>{errors.password?.message}</strong>
      <br />
      <button>Submit</button>
    </Form>
  )
}
