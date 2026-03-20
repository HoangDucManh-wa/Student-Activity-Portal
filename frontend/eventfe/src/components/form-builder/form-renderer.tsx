"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Form, Question, SubmitFormPayload } from "@/types/form/form.types"

interface FormRendererProps {
  form: Form
  onSubmit: (data: SubmitFormPayload) => void
  isSubmitting?: boolean
}

function QuestionField({ question, control }: {
  question: Question
  control: any
}) {
  const fieldName = `q_${question.questionId}`

  switch (question.type) {
    case "short_text":
    case "date":
    case "time":
      return (
        <Controller
          name={fieldName}
          control={control}
          rules={{ required: question.required ? "Trường này bắt buộc" : false }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </FieldLabel>
              {question.description && (
                <p className="text-xs text-muted-foreground mb-1">{question.description}</p>
              )}
              <Input
                {...field}
                type={question.type === "date" ? "date" : question.type === "time" ? "time" : "text"}
                placeholder={question.title}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )

    case "paragraph":
      return (
        <Controller
          name={fieldName}
          control={control}
          rules={{ required: question.required ? "Trường này bắt buộc" : false }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </FieldLabel>
              {question.description && (
                <p className="text-xs text-muted-foreground mb-1">{question.description}</p>
              )}
              <Textarea {...field} placeholder={question.title} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )

    case "multiple_choice":
      return (
        <Controller
          name={fieldName}
          control={control}
          rules={{ required: question.required ? "Trường này bắt buộc" : false }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </FieldLabel>
              {question.description && (
                <p className="text-xs text-muted-foreground mb-1">{question.description}</p>
              )}
              <div className="space-y-2 mt-1">
                {question.options.map((opt) => (
                  <label key={opt.optionId} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={String(opt.optionId)}
                      checked={field.value === String(opt.optionId)}
                      onChange={() => field.onChange(String(opt.optionId))}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )

    case "checkboxes":
      return (
        <Controller
          name={fieldName}
          control={control}
          defaultValue={[]}
          render={({ field }) => {
            const selected: string[] = Array.isArray(field.value) ? field.value : []
            return (
              <Field>
                <FieldLabel>
                  {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </FieldLabel>
                {question.description && (
                  <p className="text-xs text-muted-foreground mb-1">{question.description}</p>
                )}
                <div className="space-y-2 mt-1">
                  {question.options.map((opt) => (
                    <label key={opt.optionId} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selected.includes(String(opt.optionId))}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...selected, String(opt.optionId)]
                            : selected.filter((v) => v !== String(opt.optionId))
                          field.onChange(next)
                        }}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </Field>
            )
          }}
        />
      )

    case "dropdown":
      return (
        <Controller
          name={fieldName}
          control={control}
          rules={{ required: question.required ? "Trường này bắt buộc" : false }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </FieldLabel>
              {question.description && (
                <p className="text-xs text-muted-foreground mb-1">{question.description}</p>
              )}
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  {question.options.map((opt) => (
                    <SelectItem key={opt.optionId} value={String(opt.optionId)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )

    case "linear_scale":
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </FieldLabel>
              <div className="flex gap-1 mt-1">
                {Array.from(
                  { length: (question.scaleMax ?? 5) - (question.scaleMin ?? 1) + 1 },
                  (_, i) => (question.scaleMin ?? 1) + i
                ).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => field.onChange(String(val))}
                    className={`w-8 h-8 rounded border text-sm ${
                      field.value === String(val)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </Field>
          )}
        />
      )

    case "file_upload":
      return (
        <Field>
          <FieldLabel>
            {question.title}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </FieldLabel>
          {question.description && (
            <p className="text-xs text-muted-foreground mb-1">{question.description}</p>
          )}
          <Input type="file" className="mt-1" />
        </Field>
      )

    default:
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>{question.title}</FieldLabel>
              <Input {...field} />
            </Field>
          )}
        />
      )
  }
}

export function FormRenderer({ form: formData, onSubmit, isSubmitting }: FormRendererProps) {
  const rhf = useForm<Record<string, string | string[]>>({
    defaultValues: {},
  })

  const handleSubmit = rhf.handleSubmit((data) => {
    const allQuestions = formData.sections.flatMap((s) => s.questions)

    const answers: SubmitFormPayload["answers"] = allQuestions.map((q) => {
      const val = data[`q_${q.questionId}`]

      if (q.type === "checkboxes") {
        const ids = (Array.isArray(val) ? val : []).map(Number).filter(Boolean)
        return { questionId: q.questionId, selectedOptionIds: ids }
      }

      if (q.type === "multiple_choice" || q.type === "dropdown") {
        const id = Number(val)
        return { questionId: q.questionId, selectedOptionIds: id ? [id] : [] }
      }

      return { questionId: q.questionId, textValue: String(val || "") }
    })

    onSubmit({ answers })
  })

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{formData.title}</CardTitle>
            {formData.description && (
              <p className="text-sm text-muted-foreground">{formData.description}</p>
            )}
          </CardHeader>
        </Card>

        {formData.sections.map((section) => (
          <Card key={section.sectionId}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {section.description && (
                <p className="text-sm text-muted-foreground">{section.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <FieldGroup className="space-y-5">
                {section.questions.map((q) => (
                  <QuestionField
                    key={q.questionId}
                    question={q}
                    control={rhf.control}
                  />
                ))}
              </FieldGroup>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="w-32">
            {isSubmitting ? "Đang nộp..." : "Nộp form"}
          </Button>
        </div>
      </div>
    </form>
  )
}
