import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../hooks/useApp'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useForm } from '../hooks/useForm'
import FormInput from '../components/FormInput'
import { PageHeader } from '../components/ui'
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, PLACEHOLDER_IMAGE } from '../utils/constants'
import { isRequired } from '../utils/validators'
import { readFileAsDataURL } from '../utils/helpers'

const rules = {
  type: [[isRequired, 'Choose Lost or Found.']],
  name: [[isRequired, 'Item name is required.']],
  category: [[isRequired, 'Choose a category.']],
  date: [[isRequired, 'Date is required.']],
  location: [[isRequired, 'Location is required.']],
}
const blank = { type: 'Lost', name: '', category: '', brand: '', color: '', date: new Date().toISOString().slice(0, 10), location: '', description: '', identifyingMarks: '', currentHolder: '', value: '', offerAmount: '', offerMessage: '' }

export default function Report() {
  const { id } = useParams()
  const { items, addItem, updateItem } = useApp()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const existing = id ? items.find((i) => i.id === id) : null
  const [image, setImage] = useState(existing?.image || '')

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, reset } = useForm(blank, rules, (v) => {
    const payload = { ...v, value: parseFloat(v.value) || 0, offerAmount: parseFloat(v.offerAmount) || 0, image }
    if (existing) { updateItem(existing.id, payload); showToast('Report updated.', 'success'); navigate(`/items/${existing.id}`) }
    else { const it = addItem(payload); showToast('Report published.', 'success'); navigate(`/items/${it.id}`) }
  })
  useEffect(() => { if (existing) reset({ ...blank, ...existing, value: String(existing.value || ''), offerAmount: String(existing.offerAmount || '') }) }, [existing?.id]) // eslint-disable-line

  if (id && (!existing || (existing.userId !== currentUser.id && currentUser.role !== 'admin'))) {
    return <div className="page"><PageHeader title="Report not found" subtitle="You can only edit your own reports." /></div>
  }
  const bind = (n) => ({ name: n, value: values[n], onChange: handleChange, onBlur: handleBlur, error: errors[n], touched: touched[n] })

  async function pick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return showToast('Please choose an image file.', 'error')
    setImage(await readFileAsDataURL(file))
  }

  return (
    <div className="page page--narrow">
      <PageHeader title={existing ? 'Edit report' : 'Report an item'} subtitle="Accurate details help Smart Match find the right counterpart faster." />
      <form onSubmit={handleSubmit} noValidate className="stack">
        <section className="panel">
          <h2 className="panel__title">What happened?</h2>
          <div className="segmented" role="radiogroup" aria-label="Report type">
            {['Lost', 'Found'].map((t) => (
              <button type="button" key={t} role="radio" aria-checked={values.type === t} className={values.type === t ? 'is-active' : ''} onClick={() => setFieldValue('type', t)}>
                {t === 'Lost' ? 'I lost something' : 'I found something'}
              </button>
            ))}
          </div>
          <FormInput label="Item name" required placeholder="e.g. Black leather wallet" {...bind('name')} />
          <div className="grid-2">
            <FormInput label="Category" as="select" required {...bind('category')}>
              <option value="">Select…</option>
              {ITEM_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </FormInput>
            <FormInput label="Date" type="date" required {...bind('date')} />
          </div>
          <FormInput label="Location" required placeholder="Pick or type a campus location" {...bind('location')} />
          <div className="chips-row">{CAMPUS_LOCATIONS.slice(0, 6).map((l) => <button type="button" key={l} className="chip chip--soft" onClick={() => setFieldValue('location', l)}>{l}</button>)}</div>
        </section>

        <section className="panel">
          <h2 className="panel__title">Details</h2>
          <div className="grid-2">
            <FormInput label="Brand" placeholder="e.g. Dell" {...bind('brand')} />
            <FormInput label="Colour" placeholder="e.g. Black" {...bind('color')} />
          </div>
          <FormInput label="Description" as="textarea" placeholder="Condition, contents, stickers…" {...bind('description')} />
          <FormInput label="Identifying marks (private — used only to verify ownership)" placeholder="e.g. Scratch on the back, wallpaper" {...bind('identifyingMarks')} />
          <div className="grid-2">
            <FormInput label="Estimated value (₹)" type="number" min="0" step="1" {...bind('value')} />
            {values.type === 'Found' && <FormInput label="Currently stored at" placeholder="e.g. Library help desk" {...bind('currentHolder')} />}
          </div>
          <div className="grid-2">
            <FormInput label="Offer / reward amount (₹) — optional" type="number" min="0" step="1" placeholder="Optional" {...bind('offerAmount')} />
            <FormInput label="Offer message — optional" maxLength={255} placeholder="e.g. Happy to give a small thank-you" {...bind('offerMessage')} />
          </div>
          <p className="muted">Entirely optional. It never affects claiming or handover.</p>
          <div className="image-upload">
            <img src={image || PLACEHOLDER_IMAGE} alt="Preview" />
            <label className="btn btn--ghost btn--sm">Upload photo<input type="file" accept="image/*" onChange={pick} hidden /></label>
            {image && <button type="button" className="link-btn" onClick={() => setImage('')}>Remove</button>}
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn--primary">{existing ? 'Save changes' : 'Publish report'}</button>
        </div>
      </form>
    </div>
  )
}
