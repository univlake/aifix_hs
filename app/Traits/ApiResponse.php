<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Response;
use Symfony\Component\HttpFoundation\Response as FoundationResponse;

trait ApiResponse
{
    protected int $statusCode = FoundationResponse::HTTP_OK;

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function setStatusCode(int $statusCode, ?int $httpCode = null): static
    {
        $httpCode = $httpCode ?? $statusCode;
        $this->statusCode = $statusCode;

        return $this;
    }

    public function respond(array $data, array $header = []): JsonResponse
    {
        return Response::json($data, $this->getStatusCode(), $header);
    }

    public function status(string $status, array $data, ?int $code = null): JsonResponse
    {
        if ($code) {
            $this->setStatusCode($code);
        }
        $status = ['status' => $status, 'code' => $this->statusCode];
        $data = array_merge($status, $data);

        return $this->respond($data);
    }

    public function failed(string $message, int $code = FoundationResponse::HTTP_BAD_REQUEST, string $status = 'error'): JsonResponse
    {
        return $this->setStatusCode($code)->message($message, $status);
    }

    public function message(string $message, string $status = 'success'): JsonResponse
    {
        return $this->status($status, ['message' => $message]);
    }

    public function internalError(string $message = 'Internal Error!'): JsonResponse
    {
        return $this->failed($message, FoundationResponse::HTTP_INTERNAL_SERVER_ERROR);
    }

    public function created(string $message = 'created'): JsonResponse
    {
        return $this->setStatusCode(FoundationResponse::HTTP_CREATED)->message($message);
    }

    public function success(mixed $data, string $status = 'success'): JsonResponse
    {
        return $this->status($status, compact('data'));
    }

    public function notFound(string $message = 'Not Found!'): JsonResponse
    {
        return $this->failed($message, FoundationResponse::HTTP_NOT_FOUND);
    }
}
