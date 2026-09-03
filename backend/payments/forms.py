from django import forms

from .models import Payment, Refund


class PaymentForm(forms.ModelForm):
    class Meta:
        model = Payment
        fields = ['student', 'course', 'amount', 'currency', 'payment_method', 'payment_provider']

    def clean_amount(self):
        value = self.cleaned_data['amount']
        if value <= 0:
            raise forms.ValidationError('Amount must be greater than zero.')
        return value


class RefundForm(forms.ModelForm):
    class Meta:
        model = Refund
        fields = ['payment', 'student', 'refund_amount', 'refund_reason']

    def clean(self):
        cleaned_data = super().clean()
        payment = cleaned_data.get('payment')
        amount = cleaned_data.get('refund_amount')
        if payment and amount and amount > payment.amount:
            self.add_error('refund_amount', 'Cannot exceed the original payment amount.')
        return cleaned_data


class ProcessRefundForm(forms.ModelForm):
    class Meta:
        model = Refund
        fields = ['refund_status']
