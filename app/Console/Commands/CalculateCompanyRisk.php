<?php

namespace App\Console\Commands;

use App\Traits\CalculateRiskValue;
use Illuminate\Console\Command;

class CalculateCompanyRisk extends Command
{
    use CalculateRiskValue;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'risk:calculate {--content=定时计算 : 变更日志中记录的触发原因}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = '重新计算所有企业的固有风险值与浮动风险值，并更新集团平均风险';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $content = $this->option('content');

        $this->info('开始计算企业风险值...');

        try {
            $this->countRisk($content);
            $this->info('风险值计算完成。');
        } catch (\Throwable $e) {
            $this->error('风险值计算失败: '.$e->getMessage());

            return self::FAILURE;
        }

        return self::SUCCESS;
    }
}
