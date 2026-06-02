<?php

namespace App\Jobs;

use App\Mail\CustomerInquiryConfirmation;
use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendCustomerConfirmation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public Inquiry $inquiry;

    /**
     * Create a new job instance.
     */
    public function __construct(Inquiry $inquiry)
    {
        $this->inquiry = $inquiry;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Mail::to($this->inquiry->customer_email)->send(new CustomerInquiryConfirmation($this->inquiry));
    }
}
