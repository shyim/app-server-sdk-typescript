import {Request as AppRequest, Response as AppResponse} from '../../server';
import express from "express";

export function convertResponse(response: AppResponse, expressResponse: express.Response) {
    expressResponse.status(response.statusCode);
    response.headers.forEach((val, key) => {
        expressResponse.header(key, val);
    })

    expressResponse.send(response.body);
}

export function convertRequest(expressRequest: express.Request): AppRequest {
    const queries = new Map<string, string>();
    const headers = new Map<string, string>();

    for (const [key, value] of Object.entries(expressRequest.headers)) {
        headers.set(key, value as string);
    }

    for (const [key, value] of Object.entries(expressRequest.query)) {
        queries.set(key, value as string);
    }

    return {
        // @ts-ignore
        body: expressRequest.rawBody || '',
        headers: headers,
        query: queries,
        method: expressRequest.method
    };
}

export function rawRequestMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
    const contentType = req.headers['content-type'] || ''
        , mime = contentType.split(';')[0];

    if (mime != 'application/json') {
        return next();
    }

    let data = '';
    req.setEncoding('utf8');

    req.on('data', function(chunk: string) {
        data += chunk;
    });

    req.on('end', function() {
        // @ts-ignore
        req.rawBody = data;
        next();
    });
}