export default function FormError({ message }) {
  return (
    <p className="form-error" role="alert">
      {message}
    </p>
  )
}
