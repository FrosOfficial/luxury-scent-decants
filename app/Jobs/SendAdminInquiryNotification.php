<?php

namespace App\Jobs;

use App\Mail\AdminNewInquiry;
use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendAdminInquiryNotification implements ShouldQueue
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
        $adminEmail = config('supabase.admin_email') ?: 'admin@luxuryscentdecants.com';
        Mail::to($adminEmail)->send(new AdminNewInquiry($this->inquiry));
    }
}
